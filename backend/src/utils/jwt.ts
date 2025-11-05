import jwt from 'jsonwebtoken';
import { env } from '@/config/env';

export interface JWTPayload {
  sub: string; // User ID
  email: string;
  role: string;
  companyId: string;
}

export interface RefreshTokenPayload {
  sub: string; // User ID
  tokenId: string;
}

/**
 * Generate access token (short-lived)
 */
export function generateAccessToken(payload: JWTPayload): string {
  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
    issuer: 'reforma-pro',
    audience: 'reforma-pro-api',
  });
}

/**
 * Generate refresh token (long-lived)
 */
export function generateRefreshToken(payload: RefreshTokenPayload): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, {
    expiresIn: env.JWT_REFRESH_EXPIRES_IN,
    issuer: 'reforma-pro',
    audience: 'reforma-pro-api',
  });
}

/**
 * Verify access token
 */
export function verifyAccessToken(token: string): JWTPayload {
  try {
    return jwt.verify(token, env.JWT_SECRET, {
      issuer: 'reforma-pro',
      audience: 'reforma-pro-api',
    }) as JWTPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid token');
    }
    throw error;
  }
}

/**
 * Verify refresh token
 */
export function verifyRefreshToken(token: string): RefreshTokenPayload {
  try {
    return jwt.verify(token, env.JWT_REFRESH_SECRET, {
      issuer: 'reforma-pro',
      audience: 'reforma-pro-api',
    }) as RefreshTokenPayload;
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error('Refresh token expired');
    }
    if (error instanceof jwt.JsonWebTokenError) {
      throw new Error('Invalid refresh token');
    }
    throw error;
  }
}

/**
 * Decode token without verification (for debugging)
 */
export function decodeToken(token: string): JWTPayload | RefreshTokenPayload | null {
  return jwt.decode(token) as JWTPayload | RefreshTokenPayload | null;
}
