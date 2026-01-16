// apps/api/src/services/jwt/jwt.service.ts
import jwt from 'jsonwebtoken';
import { createHash } from 'crypto';
import { env } from '../../config/env.js';
import type { AccessTokenPayload, RefreshTokenPayload, JwtServiceInterface } from './types.js';

/**
 * JWT service for token generation and verification
 */
export const jwtService: JwtServiceInterface = {
  /**
   * Generate access token (15 minute expiry)
   */
  generateAccessToken(userId: string, email: string): string {
    const payload: Omit<AccessTokenPayload, 'iat' | 'exp'> = {
      sub: userId,
      email,
      type: 'access',
    };
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
  },

  /**
   * Generate refresh token (7 day expiry)
   */
  generateRefreshToken(userId: string): string {
    const payload: Omit<RefreshTokenPayload, 'iat' | 'exp'> = {
      sub: userId,
      type: 'refresh',
    };
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  },

  /**
   * Verify access token
   * Returns payload if valid, null if invalid/expired
   */
  verifyAccessToken(token: string): AccessTokenPayload | null {
    try {
      const payload = jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
      if (payload.type !== 'access') {
        return null;
      }
      return payload;
    } catch {
      return null;
    }
  },

  /**
   * Verify refresh token
   * Returns payload if valid, null if invalid/expired
   */
  verifyRefreshToken(token: string): RefreshTokenPayload | null {
    try {
      const payload = jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
      if (payload.type !== 'refresh') {
        return null;
      }
      return payload;
    } catch {
      return null;
    }
  },

  /**
   * Hash token for storage (using SHA256)
   */
  hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  },
};
