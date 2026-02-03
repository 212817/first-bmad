// apps/api/src/middleware/rateLimit.middleware.ts
import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { AppError } from '@repo/shared/errors';
import { ErrorCodes } from '@repo/shared/constants';

/**
 * Rate limit exceeded error
 */
export class RateLimitError extends AppError {
  constructor(message = 'Rate limit exceeded') {
    super(message, ErrorCodes.RATE_LIMIT_EXCEEDED, 429);
  }
}

/**
 * In-memory rate limiter store
 * Key: identifier (userId or IP)
 * Value: { count, resetAt }
 */
const store = new Map<string, { count: number; resetAt: number }>();

/**
 * Clean up expired entries periodically
 */
const cleanupInterval = setInterval(
  () => {
    const now = Date.now();
    for (const [key, value] of store.entries()) {
      if (value.resetAt <= now) {
        store.delete(key);
      }
    }
  },
  60 * 1000 // Clean every minute
);

// Prevent the interval from keeping the process alive
cleanupInterval.unref();

/**
 * Create a rate limiter middleware
 * @param options - Rate limiter configuration
 */
export const createRateLimiter = (options: {
  windowMs: number;
  max: number;
  keyGenerator?: (req: Request) => string;
}): RequestHandler => {
  const { windowMs, max, keyGenerator } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    // Generate key from user ID or fallback to IP
    const key = keyGenerator
      ? keyGenerator(req)
      : req.user?.id || req.ip || 'anonymous';

    const now = Date.now();
    const entry = store.get(key);

    if (!entry || entry.resetAt <= now) {
      // New window
      store.set(key, { count: 1, resetAt: now + windowMs });
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', max - 1);
      res.setHeader('X-RateLimit-Reset', Math.ceil((now + windowMs) / 1000));
      return next();
    }

    if (entry.count >= max) {
      // Rate limit exceeded
      res.setHeader('X-RateLimit-Limit', max);
      res.setHeader('X-RateLimit-Remaining', 0);
      res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetAt / 1000));
      res.setHeader('Retry-After', Math.ceil((entry.resetAt - now) / 1000));
      throw new RateLimitError();
    }

    // Increment counter
    entry.count++;
    store.set(key, entry);
    res.setHeader('X-RateLimit-Limit', max);
    res.setHeader('X-RateLimit-Remaining', max - entry.count);
    res.setHeader('X-RateLimit-Reset', Math.ceil(entry.resetAt / 1000));
    next();
  };
};

/**
 * Geocoding rate limiter - 10 requests per minute per user
 */
export const geocodingRateLimiter: RequestHandler = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 10,
});
