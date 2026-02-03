// apps/api/src/app.ts
import express, { type Express } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { corsOptions } from './config/cors.js';
import { healthRoutes } from './routes/health/health.routes.js';
import { authRoutes } from './routes/auth/auth.routes.js';
import { spotsRoutes } from './routes/spots/spots.routes.js';
import { photosRoutes } from './routes/photos/photos.routes.js';
import { geocodeRoutes } from './routes/geocode/geocode.routes.js';
import { carTagsRoutes } from './routes/car-tags/carTags.routes.js';
import { errorMiddleware, notFoundMiddleware } from './middleware/error.middleware.js';

export function createApp(): Express {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors(corsOptions));

  // Body parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  // Routes
  app.use('/health', healthRoutes);
  app.use('/v1/auth', authRoutes);
  app.use('/v1/spots', spotsRoutes);
  app.use('/v1/photos', photosRoutes);
  app.use('/v1/geocode', geocodeRoutes);
  app.use('/v1/car-tags', carTagsRoutes);

  // Error handling
  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}
