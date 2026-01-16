// apps/api/src/routes/auth/auth.service.ts
import { randomBytes } from 'crypto';
import { env } from '../../config/env.js';
import { userRepository } from '../../repositories/user.repository.js';
import { refreshTokenRepository } from '../../repositories/refreshToken.repository.js';
import { jwtService } from '../../services/jwt/jwt.service.js';
import { AuthenticationError } from '@repo/shared/errors';
import type { User } from '@repo/shared/types';
import type { GoogleTokenResponse, GoogleUserInfo, AuthResult } from './types.js';

const GOOGLE_AUTH_URL = 'https://accounts.google.com/o/oauth2/v2/auth';
const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GOOGLE_USERINFO_URL = 'https://www.googleapis.com/oauth2/v3/userinfo';

/**
 * Auth service - business logic for authentication
 */
export const authService = {
  /**
   * Build Google OAuth authorization URL
   */
  getGoogleAuthUrl(redirectUri: string): string {
    const state = randomBytes(16).toString('hex');
    const params = new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      state,
    });
    return `${GOOGLE_AUTH_URL}?${params.toString()}`;
  },

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string, redirectUri: string): Promise<GoogleTokenResponse> {
    const response = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: env.GOOGLE_CLIENT_ID,
        client_secret: env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('Google token exchange failed:', error);
      throw new AuthenticationError('Failed to exchange authorization code');
    }

    return response.json() as Promise<GoogleTokenResponse>;
  },

  /**
   * Fetch user info from Google
   */
  async getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
    const response = await fetch(GOOGLE_USERINFO_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!response.ok) {
      throw new AuthenticationError('Failed to fetch user info from Google');
    }

    return response.json() as Promise<GoogleUserInfo>;
  },

  /**
   * Handle Google OAuth callback - create or retrieve user, generate tokens
   */
  async handleGoogleCallback(code: string, redirectUri: string): Promise<AuthResult> {
    // Exchange code for tokens
    const tokens = await this.exchangeCodeForTokens(code, redirectUri);

    // Get user info from Google
    const googleUser = await this.getGoogleUserInfo(tokens.access_token);

    // Find or create user
    let user = await userRepository.findByProviderAndId('google', googleUser.sub);

    if (user) {
      // Update last login
      user = (await userRepository.updateLastLogin(user.id)) ?? user;
    } else {
      // Create new user
      user = await userRepository.create({
        email: googleUser.email,
        displayName: googleUser.name ?? null,
        avatarUrl: googleUser.picture ?? null,
        provider: 'google',
        providerId: googleUser.sub,
      });
    }

    // Generate JWT tokens
    const accessToken = jwtService.generateAccessToken(user.id, user.email);
    const refreshToken = jwtService.generateRefreshToken(user.id);

    // Store refresh token hash
    const tokenHash = jwtService.hashToken(refreshToken);
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days
    await refreshTokenRepository.create({ userId: user.id, tokenHash, expiresAt });

    return { user, accessToken, refreshToken };
  },

  /**
   * Refresh access token using refresh token
   */
  async refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; user: User }> {
    // Verify refresh token
    const payload = jwtService.verifyRefreshToken(refreshToken);
    if (!payload) {
      throw new AuthenticationError('Invalid or expired refresh token');
    }

    // Check if token exists in database
    const tokenHash = jwtService.hashToken(refreshToken);
    const storedToken = await refreshTokenRepository.findByTokenHash(tokenHash);
    if (!storedToken) {
      throw new AuthenticationError('Refresh token not found');
    }

    // Check if expired
    if (storedToken.expiresAt < new Date()) {
      await refreshTokenRepository.deleteByTokenHash(tokenHash);
      throw new AuthenticationError('Refresh token expired');
    }

    // Get user
    const user = await userRepository.findById(payload.sub);
    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Generate new access token
    const accessToken = jwtService.generateAccessToken(user.id, user.email);

    return { accessToken, user };
  },

  /**
   * Get current user by ID
   */
  async getCurrentUser(userId: string): Promise<User> {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AuthenticationError('User not found');
    }
    return user;
  },

  /**
   * Logout - invalidate refresh token
   */
  async logout(refreshToken: string): Promise<void> {
    const tokenHash = jwtService.hashToken(refreshToken);
    await refreshTokenRepository.deleteByTokenHash(tokenHash);
  },

  /**
   * Logout from all devices
   */
  async logoutAll(userId: string): Promise<void> {
    await refreshTokenRepository.deleteByUserId(userId);
  },
};
