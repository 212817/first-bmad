// apps/api/src/routes/auth/types.ts
import type { User } from '@repo/shared/types';

/**
 * Google OAuth token response
 */
export interface GoogleTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope: string;
  id_token?: string;
}

/**
 * Google user info response
 */
export interface GoogleUserInfo {
  sub: string; // Google's unique user ID (providerId)
  email: string;
  email_verified: boolean;
  name?: string;
  picture?: string;
  given_name?: string;
  family_name?: string;
}

/**
 * Auth service result for login/signup
 */
export interface AuthResult {
  user: User;
  accessToken: string;
  refreshToken: string;
}

/**
 * Current user response (public-safe)
 */
export interface CurrentUserResponse {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
}

/**
 * Cookie options for tokens
 */
export interface CookieConfig {
  httpOnly: boolean;
  secure: boolean;
  sameSite: 'lax' | 'strict' | 'none';
  maxAge: number;
  path: string;
}
