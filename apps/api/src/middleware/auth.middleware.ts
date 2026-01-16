// apps/api/src/middleware/auth.middleware.ts
import type { Request, Response, NextFunction } from 'express';
import { jwtService } from '../services/jwt/jwt.service.js';
import { AuthenticationError } from '@repo/shared/errors';

/**
 * Authenticated user attached to request
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
}

/**
 * Extend Express Request to include user
 */
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Auth middleware - verifies JWT token and attaches user to request
 * Checks both Authorization header and accessToken cookie
 */
export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  // Try Authorization header first
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  // Fall back to cookie
  if (!token && req.cookies?.accessToken) {
    token = req.cookies.accessToken as string;
  }

  if (!token) {
    throw new AuthenticationError('Access token required');
  }

  const payload = jwtService.verifyAccessToken(token);
  if (!payload) {
    throw new AuthenticationError('Invalid or expired access token');
  }

  req.user = {
    id: payload.sub,
    email: payload.email,
  };

  next();
}

/**
 * Optional auth middleware - attaches user if token present, but doesn't require it
 */
export function optionalAuthMiddleware(req: Request, _res: Response, next: NextFunction): void {
  let token: string | undefined;

  const authHeader = req.headers.authorization;
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7);
  }

  if (!token && req.cookies?.accessToken) {
    token = req.cookies.accessToken as string;
  }

  if (token) {
    const payload = jwtService.verifyAccessToken(token);
    if (payload) {
      req.user = {
        id: payload.sub,
        email: payload.email,
      };
    }
  }

  next();
}
