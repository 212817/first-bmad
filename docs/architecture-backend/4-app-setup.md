# 4. App Setup

### 4.1 Express Application

```typescript
// src/app.ts
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { corsConfig } from './config/cors';
import { errorMiddleware } from './middleware/error.middleware';
import { rateLimitMiddleware } from './middleware/rateLimit.middleware';
import { authRoutes } from './routes/auth/auth.routes';
import { spotsRoutes } from './routes/spots/spots.routes';
import { photosRoutes } from './routes/photos/photos.routes';
import { geocodeRoutes } from './routes/geocode/geocode.routes';
import { healthRoutes } from './routes/health/health.routes';

export function createApp() {
  const app = express();

  // Security middleware
  app.use(helmet());
  app.use(cors(corsConfig));
  app.use(cookieParser());
  app.use(express.json({ limit: '1mb' }));

  // Rate limiting
  app.use(rateLimitMiddleware);

  // Routes
  app.use('/v1/auth', authRoutes);
  app.use('/v1/spots', spotsRoutes);
  app.use('/v1/photos', photosRoutes);
  app.use('/v1/geocode', geocodeRoutes);
  app.use('/health', healthRoutes);

  // Error handling (must be last)
  app.use(errorMiddleware);

  return app;
}
```

### 4.2 Entry Point

```typescript
// src/index.ts
import { createApp } from './app';
import { env } from './config/env';
import { initMonitoring } from './middleware/monitoring';

initMonitoring();

const app = createApp();
const port = env.PORT || 3001;

app.listen(port, () => {
  console.log(`API server running on port ${port}`);
});

export default app; // For Vercel serverless
```

---
