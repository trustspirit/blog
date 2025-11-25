import { Config } from '../utils/config';
import { Firebase } from '../utils/firebase';
import { generateAccessToken, generateRefreshToken, validateToken } from '../utils/jwt';
import { authMiddleware, createUnauthorizedResponse } from '../middleware/auth';
import { GoogleLoginRequest, RefreshTokenRequest, AuthResponse, TokenResponse, User, MessageResponse } from '../types';

export async function handleGoogleLogin(
  request: Request,
  config: Config,
  firebase: Firebase
): Promise<Response> {
  try {
    const body: GoogleLoginRequest = await request.json();
    const { token } = body;

    if (!token) {
      return new Response(
        JSON.stringify({ error: 'Token is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate Google token
    // Note: In Cloudflare Workers, we need to validate the Google token
    // This is a simplified version - you may need to use Google's token validation API
    const googleValidationUrl = `https://oauth2.googleapis.com/tokeninfo?id_token=${token}`;
    const validationResponse = await fetch(googleValidationUrl);
    
    if (!validationResponse.ok) {
      return new Response(
        JSON.stringify({ error: 'Invalid Google token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const payload = await validationResponse.json();
    
    if (payload.aud !== config.googleClientID) {
      return new Response(
        JSON.stringify({ error: 'Invalid Google token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const email = payload.email;
    const name = payload.name || '';
    const picture = payload.picture || '';

    // Check if user is admin
    if (!config.isAdminEmail(email)) {
      return new Response(
        JSON.stringify({ error: 'Only admin users can log in' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const userID = payload.sub;

    // Create or update user in Firestore
    const userData: Record<string, any> = {
      email,
      name,
      picture,
      lastLoginAt: new Date().toISOString(),
    };

    const existingUser = await firebase.getUser(userID);
    if (!existingUser) {
      userData.createdAt = new Date().toISOString();
    }

    await firebase.createOrUpdateUser(userID, userData);

    // Generate JWT tokens
    const accessToken = await generateAccessToken(userID, email, config.jwtSecret);
    const refreshToken = await generateRefreshToken(userID, email, config.jwtSecret);

    // Save refresh token to Firestore
    await firebase.saveRefreshToken(userID, refreshToken);

    // Get user data for response
    const user: User = {
      id: userID,
      email,
      name,
      picture,
    };

    const response: AuthResponse = {
      accessToken,
      refreshToken,
      user,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function handleRefreshToken(
  request: Request,
  config: Config,
  firebase: Firebase
): Promise<Response> {
  try {
    const body: RefreshTokenRequest = await request.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return new Response(
        JSON.stringify({ error: 'Refresh token is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate refresh token
    let claims;
    try {
      claims = await validateToken(refreshToken, config.jwtSecret);
    } catch (error) {
      return new Response(
        JSON.stringify({ error: 'Invalid refresh token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check if refresh token exists in Firestore
    const storedToken = await firebase.getRefreshToken(claims.sub);
    if (!storedToken || storedToken !== refreshToken) {
      return new Response(
        JSON.stringify({ error: 'Invalid refresh token' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate new access token
    const accessToken = await generateAccessToken(claims.sub, claims.email, config.jwtSecret);

    const response: TokenResponse = {
      accessToken,
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function handleGetMe(
  request: Request,
  config: Config,
  firebase: Firebase
): Promise<Response> {
  const auth = await authMiddleware(request, config);
  if (!auth) {
    return createUnauthorizedResponse();
  }

  try {
    const userData = await firebase.getUser(auth.userID);
    if (!userData) {
      return new Response(
        JSON.stringify({ error: 'User not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const user: User = {
      id: auth.userID,
      email: userData.email as string,
      name: userData.name as string,
      picture: userData.picture as string,
    };

    return new Response(JSON.stringify(user), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function handleLogout(
  request: Request,
  config: Config,
  firebase: Firebase
): Promise<Response> {
  const auth = await authMiddleware(request, config);
  if (!auth) {
    return createUnauthorizedResponse();
  }

  try {
    await firebase.deleteRefreshToken(auth.userID);

    const response: MessageResponse = {
      message: 'Logged out successfully',
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: 'Failed to logout' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

