// apps/api/src/middleware/error.middleware.ts
import type { Request, Response, NextFunction, ErrorRequestHandler } from 'express';
import { AppError } from '@repo/shared/errors';
import { env } from '../config/env.js';

interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
    stack?: string;
  };
}

export const errorMiddleware: ErrorRequestHandler = (
  err: Error,
  _req: Request,
  res: Response<ErrorResponse>,
  _next: NextFunction
): void => {
  console.error('Error:', err);

  // Handle AppError (our custom errors)
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.name === 'ValidationError' && 'fields' in err
          ? { fields: (err as AppError & { fields?: Record<string, string> }).fields }
          : {}),
        ...(env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
      },
    });
    return;
  }

  // Handle unknown errors
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
      ...(env.NODE_ENV === 'development' ? { stack: err.stack } : {}),
    },
  });
};

export const notFoundMiddleware = (_req: Request, res: Response): void => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: 'Endpoint not found',
    },
  });
};
