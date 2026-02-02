// apps/api/src/routes/auth/auth.routes.ts
import { Router, type Router as RouterType } from 'express';
import { authService } from './auth.service.js';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { env } from '../../config/env.js';
import type { CurrentUserResponse } from './types.js';

export const authRoutes: RouterType = Router();

// Cookie configuration
const ACCESS_TOKEN_MAX_AGE = 15 * 60 * 1000; // 15 minutes
const REFRESH_TOKEN_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

// Cross-origin cookies (frontend on Vercel, backend on Railway)
// require sameSite: 'none' and secure: true
function getCookieOptions(maxAge: number) {
  const isProduction = env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    secure: isProduction, // Required for sameSite: 'none'
    sameSite: isProduction ? ('none' as const) : ('lax' as const),
    maxAge,
    path: '/',
  };
}

/**
 * GET /auth/google
 * Initiates Google OAuth flow by redirecting to Google consent screen
 */
authRoutes.get('/google', (req, res) => {
  const baseUrl = env.API_BASE_URL || 'http://localhost:3001';
  const redirectUri = baseUrl + '/v1/auth/google/callback';
  const authUrl = authService.getGoogleAuthUrl(redirectUri);
  res.redirect(authUrl);
});

/**
 * GET /auth/google/callback
 * Handles OAuth callback from Google
 */
authRoutes.get('/google/callback', async (req, res) => {
  const code = req.query.code as string | undefined;
  const error = req.query.error as string | undefined;
  const frontendUrl = env.CORS_ORIGINS.split(',')[0];

  // Handle OAuth errors
  if (error) {
    return res.redirect(frontendUrl + '/login?error=' + encodeURIComponent(error));
  }

  if (!code) {
    return res.redirect(frontendUrl + '/login?error=no_code');
  }

  try {
    const baseUrl = env.API_BASE_URL || 'http://localhost:3001';
    const redirectUri = baseUrl + '/v1/auth/google/callback';

    const result = await authService.handleGoogleCallback(code, redirectUri);

    // Set cookies
    res.cookie('accessToken', result.accessToken, getCookieOptions(ACCESS_TOKEN_MAX_AGE));
    res.cookie('refreshToken', result.refreshToken, getCookieOptions(REFRESH_TOKEN_MAX_AGE));

    // Redirect to frontend
    res.redirect(frontendUrl + '/');
  } catch (err) {
    console.error('OAuth callback error:', err);
    const errorMessage = err instanceof Error ? err.message : 'unknown_error';
    res.redirect(frontendUrl + '/login?error=' + encodeURIComponent(errorMessage));
  }
});

/**
 * GET /auth/me
 * Returns current authenticated user info
 */
authRoutes.get('/me', authMiddleware, async (req, res) => {
  const user = await authService.getCurrentUser(req.user!.id);

  const response: CurrentUserResponse = {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    avatarUrl: user.avatarUrl,
  };

  res.json({ success: true, data: response });
});

/**
 * POST /auth/refresh
 * Refreshes access token using refresh token cookie
 */
authRoutes.post('/refresh', async (req, res) => {
  const refreshToken = req.cookies?.refreshToken as string | undefined;

  if (!refreshToken) {
    res.status(401).json({
      success: false,
      error: { code: 'AUTHENTICATION_ERROR', message: 'Refresh token required' },
    });
    return;
  }

  const result = await authService.refreshAccessToken(refreshToken);

  // Set new access token cookie
  res.cookie('accessToken', result.accessToken, getCookieOptions(ACCESS_TOKEN_MAX_AGE));

  res.json({
    success: true,
    data: {
      id: result.user.id,
      email: result.user.email,
      displayName: result.user.displayName,
      avatarUrl: result.user.avatarUrl,
    },
  });
});

/**
 * POST /auth/logout
 * Invalidates refresh token and clears cookies
 */
authRoutes.post('/logout', async (req, res) => {
  const refreshToken = req.cookies?.refreshToken as string | undefined;

  if (refreshToken) {
    await authService.logout(refreshToken);
  }

  // Clear cookies
  res.clearCookie('accessToken', { path: '/' });
  res.clearCookie('refreshToken', { path: '/' });

  res.json({ success: true, data: null });
});
