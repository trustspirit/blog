import { validateToken } from '../utils/jwt';
import { Config } from '../utils/config';
import { JWTClaims } from '../types';

export async function authMiddleware(
  request: Request,
  config: Config
): Promise<{ userID: string; email: string } | null> {
  const authHeader = request.headers.get('Authorization');
  
  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  const tokenString = parts[1];
  
  try {
    const claims = await validateToken(tokenString, config.jwtSecret);
    return {
      userID: claims.sub,
      email: claims.email,
    };
  } catch (error) {
    return null;
  }
}

export function createUnauthorizedResponse(): Response {
  return new Response(
    JSON.stringify({ error: 'Unauthorized' }),
    {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

