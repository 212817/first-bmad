# 8. Middleware

### 8.1 Authentication Middleware

```typescript
// middleware/auth.middleware.ts
import type { Request, Response, NextFunction } from 'express';
import { jwtService } from '@/services/jwt/jwt.service';
import { AuthenticationError } from '@repo/shared/errors';

export async function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthenticationError('Missing authorization header');
  }

  const token = authHeader.slice(7);

  try {
    const payload = jwtService.verifyAccessToken(token);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    throw new AuthenticationError('Invalid or expired token');
  }
}
```

### 8.2 Error Middleware

```typescript
// middleware/error.middleware.ts
import type { Request, Response, NextFunction } from 'express';
import { AppError } from '@repo/shared/errors';
import * as Sentry from '@sentry/node';

export function errorMiddleware(error: Error, req: Request, res: Response, next: NextFunction) {
  // Log to Sentry in production
  if (process.env.NODE_ENV === 'production') {
    Sentry.captureException(error, {
      extra: {
        path: req.path,
        method: req.method,
        userId: req.user?.id,
      },
    });
  }

  // Operational errors (expected)
  if (error instanceof AppError) {
    return res.status(error.statusCode).json({
      success: false,
      error: {
        code: error.code,
        message: error.message,
        ...(error instanceof ValidationError && { fields: error.fields }),
      },
    });
  }

  // Unexpected errors
  console.error('Unexpected error:', error);

  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message:
        process.env.NODE_ENV === 'production' ? 'An unexpected error occurred' : error.message,
    },
  });
}
```

### 8.3 Validation Middleware

```typescript
// middleware/validate.middleware.ts
import type { Request, Response, NextFunction } from 'express';
import type { ZodSchema } from 'zod';
import { ValidationError } from '@repo/shared/errors';

export function validate(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse({
      body: req.body,
      query: req.query,
      params: req.params,
    });

    if (!result.success) {
      const fields: Record<string, string> = {};

      for (const issue of result.error.issues) {
        const path = issue.path.join('.');
        fields[path] = issue.message;
      }

      throw new ValidationError('Validation failed', fields);
    }

    req.body = result.data.body;
    req.query = result.data.query as any;
    req.params = result.data.params as any;

    next();
  };
}
```

### 8.4 Rate Limit Middleware

```typescript
// middleware/rateLimit.middleware.ts
import rateLimit from 'express-rate-limit';

// General API rate limit
export const rateLimitMiddleware = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many requests, please try again later',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Stricter limit for auth endpoints
export const authRateLimitMiddleware = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // 10 attempts per 15 minutes
  message: {
    success: false,
    error: {
      code: 'RATE_LIMIT_EXCEEDED',
      message: 'Too many login attempts, please try again later',
    },
  },
});
```

---
