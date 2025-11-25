import * as jose from 'jose';
import { JWTClaims } from '../types';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY = '7d';

export async function generateAccessToken(
  userID: string,
  email: string,
  secret: string
): Promise<string> {
  const secretKey = new TextEncoder().encode(secret);
  
  const token = await new jose.SignJWT({ sub: userID, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(ACCESS_TOKEN_EXPIRY)
    .sign(secretKey);

  return token;
}

export async function generateRefreshToken(
  userID: string,
  email: string,
  secret: string
): Promise<string> {
  const secretKey = new TextEncoder().encode(secret);
  
  const token = await new jose.SignJWT({ sub: userID, email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(REFRESH_TOKEN_EXPIRY)
    .sign(secretKey);

  return token;
}

export async function validateToken(
  tokenString: string,
  secret: string
): Promise<JWTClaims> {
  const secretKey = new TextEncoder().encode(secret);
  
  try {
    const { payload } = await jose.jwtVerify(tokenString, secretKey);
    return {
      sub: payload.sub as string,
      email: payload.email as string,
      iat: payload.iat as number,
      exp: payload.exp as number,
    };
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

