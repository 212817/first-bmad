// apps/api/src/app.ts
import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { corsOptions } from './config/cors.js';
import { healthRoutes } from './routes/health/health.routes.js';
import { errorMiddleware, notFoundMiddleware } from './middleware/error.middleware.js';

export function createApp(): Express {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors(corsOptions));

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Routes
  app.use('/health', healthRoutes);

  // Error handling
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
