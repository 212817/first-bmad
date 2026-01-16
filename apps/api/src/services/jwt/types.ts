// apps/api/src/services/jwt/types.ts

/**
 * Access token payload structure
 */
export interface AccessTokenPayload {
  sub: string; // userId
  email: string;
  type: 'access';
  iat?: number;
  exp?: number;
}

/**
 * Refresh token payload structure
 */
export interface RefreshTokenPayload {
  sub: string; // userId
  type: 'refresh';
  iat?: number;
  exp?: number;
}

/**
 * Token verification result - success case
 */
export interface TokenVerificationSuccess<T> {
  valid: true;
  payload: T;
}

/**
 * Token verification result - failure case
 */
export interface TokenVerificationFailure {
  valid: false;
  error: 'expired' | 'invalid' | 'malformed';
}

/**
 * Token verification result union type
 */
export type TokenVerificationResult<T> = TokenVerificationSuccess<T> | TokenVerificationFailure;

/**
 * JWT service interface
 */
export interface JwtServiceInterface {
  generateAccessToken(userId: string, email: string): string;
  generateRefreshToken(userId: string): string;
  verifyAccessToken(token: string): AccessTokenPayload | null;
  verifyRefreshToken(token: string): RefreshTokenPayload | null;
  hashToken(token: string): string;
}
