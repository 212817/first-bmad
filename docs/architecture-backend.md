# Where Did I Park? - Backend Architecture

> **Version:** 1.0.0  
> **Parent:** [architecture.md](./architecture.md)  
> **Created:** 2026-01-15

---

## 1. Tech Stack

| Technology         | Version  | Purpose                   |
| ------------------ | -------- | ------------------------- |
| Node.js            | 22.x LTS | Runtime                   |
| Express            | 5.x      | Web framework             |
| TypeScript         | 5.7.x    | Type safety (strict mode) |
| Drizzle ORM        | 0.38.x   | Database ORM              |
| PostgreSQL         | 17.x     | Database (Neon)           |
| Zod                | 3.24.x   | Request validation        |
| jsonwebtoken       | 9.x      | JWT handling              |
| @aws-sdk/client-s3 | 3.x      | R2 storage                |
| Vitest             | 3.x      | Testing                   |
| ESLint             | 9.x      | Linting (flat config)     |

---

## 2. Project Structure

```
apps/api/
├── src/
│   ├── routes/                  # API endpoints
│   │   ├── auth/
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.service.ts
│   │   │   └── types.ts
│   │   ├── spots/
│   │   │   ├── spots.routes.ts
│   │   │   ├── spots.service.ts
│   │   │   └── types.ts
│   │   ├── photos/
│   │   │   ├── photos.routes.ts
│   │   │   ├── photos.service.ts
│   │   │   └── types.ts
│   │   ├── geocode/
│   │   │   ├── geocode.routes.ts
│   │   │   ├── geocode.service.ts
│   │   │   └── types.ts
│   │   └── health/
│   │       └── health.routes.ts
│   ├── services/                # Shared services
│   │   ├── jwt/
│   │   │   ├── jwt.service.ts
│   │   │   └── types.ts
│   │   ├── r2/
│   │   │   ├── r2.service.ts
│   │   │   └── types.ts
│   │   └── geocoding/
│   │       ├── geocoding.service.ts
│   │       └── types.ts
│   ├── repositories/            # Data access
│   │   ├── user.repository.ts
│   │   ├── spot.repository.ts
│   │   ├── geocache.repository.ts
│   │   └── types.ts
│   ├── middleware/
│   │   ├── auth.middleware.ts
│   │   ├── error.middleware.ts
│   │   ├── rateLimit.middleware.ts
│   │   ├── validate.middleware.ts
│   │   └── types.ts
│   ├── config/
│   │   ├── env.ts               # Environment validation
│   │   ├── db.ts                # Database connection
│   │   └── cors.ts              # CORS config
│   ├── types/                   # Shared BE types
│   │   ├── express.d.ts         # Express augmentation
│   │   └── index.ts
│   ├── app.ts                   # Express app setup
│   └── index.ts                 # Entry point
├── test/
│   ├── setup.ts                 # Test setup
│   ├── helpers/
│   │   └── testDb.ts
│   └── integration/
│       ├── auth.test.ts
│       └── spots.test.ts
├── drizzle/
│   └── migrations/              # DB migrations
├── drizzle.config.ts
├── tsconfig.json
├── vitest.config.ts
└── package.json
```

---

## 3. Database Schema (Drizzle)

### 3.1 Schema Definition

```typescript
// packages/shared/src/db/schema.ts
import {
  pgTable,
  uuid,
  varchar,
  text,
  decimal,
  boolean,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    displayName: varchar('display_name', { length: 255 }),
    avatarUrl: text('avatar_url'),
    provider: varchar('provider', { length: 20 }).notNull(), // 'google' | 'apple'
    providerId: varchar('provider_id', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    lastLoginAt: timestamp('last_login_at').defaultNow().notNull(),
  },
  (table) => ({
    providerIdx: index('users_provider_idx').on(table.provider, table.providerId),
  })
);

export const parkingSpots = pgTable(
  'parking_spots',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    latitude: decimal('latitude', { precision: 10, scale: 7 }).notNull(),
    longitude: decimal('longitude', { precision: 10, scale: 7 }).notNull(),
    address: text('address'),
    photoUrl: text('photo_url'),
    note: text('note'),
    floor: varchar('floor', { length: 50 }),
    spotIdentifier: varchar('spot_identifier', { length: 100 }),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userActiveIdx: index('spots_user_active_idx').on(table.userId, table.isActive),
    userCreatedIdx: index('spots_user_created_idx').on(table.userId, table.createdAt),
  })
);

export const carTags = pgTable('car_tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  spotId: uuid('spot_id')
    .notNull()
    .references(() => parkingSpots.id, { onDelete: 'cascade' }),
  label: varchar('label', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const geocodingCache = pgTable(
  'geocoding_cache',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    lat: decimal('lat', { precision: 10, scale: 7 }).notNull(),
    lng: decimal('lng', { precision: 10, scale: 7 }).notNull(),
    address: text('address').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    expiresAt: timestamp('expires_at').notNull(),
  },
  (table) => ({
    coordsIdx: index('geocache_coords_idx').on(table.lat, table.lng),
  })
);

export const refreshTokens = pgTable(
  'refresh_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: varchar('token_hash', { length: 64 }).notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index('refresh_tokens_user_idx').on(table.userId),
    tokenIdx: index('refresh_tokens_token_idx').on(table.tokenHash),
  })
);
```

### 3.2 Type Inference

```typescript
// packages/shared/src/db/types.ts
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { users, parkingSpots, carTags, geocodingCache, refreshTokens } from './schema';

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type ParkingSpot = InferSelectModel<typeof parkingSpots>;
export type NewParkingSpot = InferInsertModel<typeof parkingSpots>;

export type CarTag = InferSelectModel<typeof carTags>;
export type NewCarTag = InferInsertModel<typeof carTags>;

export type GeocodingCache = InferSelectModel<typeof geocodingCache>;
export type RefreshToken = InferSelectModel<typeof refreshTokens>;
```

---

## 4. App Setup

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

## 5. Route Architecture

### 5.1 Route Handler Pattern

```typescript
// routes/spots/spots.routes.ts
import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validate.middleware';
import { spotsService } from './spots.service';
import { createSpotSchema, updateSpotSchema } from './types';

export const spotsRoutes = Router();

// All routes require authentication
spotsRoutes.use(authMiddleware);

// POST /v1/spots - Create new parking spot
spotsRoutes.post('/', validate(createSpotSchema), async (req, res) => {
  const spot = await spotsService.createSpot(req.user!.id, req.body);
  res.status(201).json({ success: true, data: spot });
});

// GET /v1/spots - List spots (paginated)
spotsRoutes.get('/', async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 20, 100);

  const result = await spotsService.getSpots(req.user!.id, { page, limit });
  res.json({ success: true, ...result });
});

// GET /v1/spots/active - Get active spot
spotsRoutes.get('/active', async (req, res) => {
  const spot = await spotsService.getActiveSpot(req.user!.id);
  res.json({ success: true, data: spot });
});

// GET /v1/spots/:id - Get spot by ID
spotsRoutes.get('/:id', async (req, res) => {
  const spot = await spotsService.getSpotById(req.user!.id, req.params.id);
  res.json({ success: true, data: spot });
});

// PATCH /v1/spots/:id - Update spot
spotsRoutes.patch('/:id', validate(updateSpotSchema), async (req, res) => {
  const spot = await spotsService.updateSpot(req.user!.id, req.params.id, req.body);
  res.json({ success: true, data: spot });
});

// POST /v1/spots/:id/clear - Mark spot as cleared
spotsRoutes.post('/:id/clear', async (req, res) => {
  const spot = await spotsService.clearSpot(req.user!.id, req.params.id);
  res.json({ success: true, data: spot });
});

// DELETE /v1/spots/:id - Delete spot
spotsRoutes.delete('/:id', async (req, res) => {
  await spotsService.deleteSpot(req.user!.id, req.params.id);
  res.status(204).send();
});
```

### 5.2 Route Types

```typescript
// routes/spots/types.ts
import { z } from 'zod';

export const createSpotSchema = z.object({
  body: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    photoUrl: z.string().url().optional(),
    note: z.string().max(500).optional(),
    floor: z.string().max(50).optional(),
    spotIdentifier: z.string().max(100).optional(),
    tags: z.array(z.string().max(100)).max(10).optional(),
  }),
});

export const updateSpotSchema = z.object({
  body: z.object({
    note: z.string().max(500).optional(),
    floor: z.string().max(50).optional(),
    spotIdentifier: z.string().max(100).optional(),
  }),
});

export type CreateSpotInput = z.infer<typeof createSpotSchema>['body'];
export type UpdateSpotInput = z.infer<typeof updateSpotSchema>['body'];
```

---

## 6. Service Layer

### 6.1 Service Pattern

```typescript
// routes/spots/spots.service.ts
import { spotRepository } from '@/repositories/spot.repository';
import { geocodingService } from '@/services/geocoding/geocoding.service';
import { NotFoundError, AuthorizationError } from '@repo/shared/errors';
import type { CreateSpotInput, UpdateSpotInput } from './types';
import type { ParkingSpot } from '@repo/shared/types';

export const spotsService = {
  createSpot: async (userId: string, data: CreateSpotInput): Promise<ParkingSpot> => {
    // Deactivate any existing active spot
    await spotRepository.deactivateUserSpots(userId);

    // Reverse geocode to get address
    let address: string | null = null;
    try {
      address = await geocodingService.reverseGeocode(data.latitude, data.longitude);
    } catch {
      // Non-critical - continue without address
    }

    // Create the spot
    const spot = await spotRepository.create({
      userId,
      latitude: data.latitude,
      longitude: data.longitude,
      address,
      photoUrl: data.photoUrl,
      note: data.note,
      floor: data.floor,
      spotIdentifier: data.spotIdentifier,
      isActive: true,
    });

    // Add tags if provided
    if (data.tags?.length) {
      await spotRepository.addTags(spot.id, data.tags);
    }

    return spot;
  },

  getActiveSpot: async (userId: string): Promise<ParkingSpot | null> => {
    return spotRepository.findActiveByUser(userId);
  },

  getSpotById: async (userId: string, spotId: string): Promise<ParkingSpot> => {
    const spot = await spotRepository.findById(spotId);

    if (!spot) {
      throw new NotFoundError('Parking spot');
    }

    if (spot.userId !== userId) {
      throw new AuthorizationError('Not authorized to access this spot');
    }

    return spot;
  },

  getSpots: async (userId: string, options: { page: number; limit: number }) => {
    const [spots, total] = await Promise.all([
      spotRepository.findByUser(userId, options),
      spotRepository.countByUser(userId),
    ]);

    return {
      data: spots,
      meta: {
        page: options.page,
        limit: options.limit,
        total,
        hasMore: options.page * options.limit < total,
      },
    };
  },

  clearSpot: async (userId: string, spotId: string): Promise<ParkingSpot> => {
    const spot = await spotsService.getSpotById(userId, spotId);
    return spotRepository.update(spotId, { isActive: false });
  },

  updateSpot: async (
    userId: string,
    spotId: string,
    data: UpdateSpotInput
  ): Promise<ParkingSpot> => {
    await spotsService.getSpotById(userId, spotId); // Verify ownership
    return spotRepository.update(spotId, data);
  },

  deleteSpot: async (userId: string, spotId: string): Promise<void> => {
    await spotsService.getSpotById(userId, spotId); // Verify ownership
    await spotRepository.delete(spotId);
  },
};
```

---

## 7. Repository Layer

### 7.1 Repository Pattern

```typescript
// repositories/spot.repository.ts
import { db } from '@/config/db';
import { parkingSpots, carTags } from '@repo/shared/db';
import { eq, and, desc } from 'drizzle-orm';
import type { ParkingSpot, NewParkingSpot } from '@repo/shared/db/types';

export const spotRepository = {
  create: async (data: NewParkingSpot): Promise<ParkingSpot> => {
    const [spot] = await db.insert(parkingSpots).values(data).returning();
    return spot;
  },

  findById: async (id: string): Promise<ParkingSpot | null> => {
    const [spot] = await db.select().from(parkingSpots).where(eq(parkingSpots.id, id)).limit(1);
    return spot || null;
  },

  findActiveByUser: async (userId: string): Promise<ParkingSpot | null> => {
    const [spot] = await db
      .select()
      .from(parkingSpots)
      .where(and(eq(parkingSpots.userId, userId), eq(parkingSpots.isActive, true)))
      .limit(1);
    return spot || null;
  },

  findByUser: async (
    userId: string,
    options: { page: number; limit: number }
  ): Promise<ParkingSpot[]> => {
    const offset = (options.page - 1) * options.limit;
    return db
      .select()
      .from(parkingSpots)
      .where(eq(parkingSpots.userId, userId))
      .orderBy(desc(parkingSpots.createdAt))
      .limit(options.limit)
      .offset(offset);
  },

  countByUser: async (userId: string): Promise<number> => {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(parkingSpots)
      .where(eq(parkingSpots.userId, userId));
    return Number(result[0]?.count || 0);
  },

  update: async (id: string, data: Partial<ParkingSpot>): Promise<ParkingSpot> => {
    const [spot] = await db
      .update(parkingSpots)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(parkingSpots.id, id))
      .returning();
    return spot;
  },

  deactivateUserSpots: async (userId: string): Promise<void> => {
    await db
      .update(parkingSpots)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(eq(parkingSpots.userId, userId), eq(parkingSpots.isActive, true)));
  },

  delete: async (id: string): Promise<void> => {
    await db.delete(parkingSpots).where(eq(parkingSpots.id, id));
  },

  addTags: async (spotId: string, labels: string[]): Promise<void> => {
    const tags = labels.map((label) => ({ spotId, label }));
    await db.insert(carTags).values(tags);
  },
};
```

---

## 8. Middleware

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

## 9. External Services

### 9.1 JWT Service

```typescript
// services/jwt/jwt.service.ts
import jwt from 'jsonwebtoken';
import { env } from '@/config/env';
import type { AccessTokenPayload, RefreshTokenPayload } from './types';

export const jwtService = {
  generateAccessToken: (userId: string, email: string): string => {
    const payload: AccessTokenPayload = {
      sub: userId,
      email,
      type: 'access',
    };
    return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: '15m' });
  },

  generateRefreshToken: (userId: string): string => {
    const payload: RefreshTokenPayload = {
      sub: userId,
      type: 'refresh',
    };
    return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: '7d' });
  },

  verifyAccessToken: (token: string): AccessTokenPayload => {
    return jwt.verify(token, env.JWT_ACCESS_SECRET) as AccessTokenPayload;
  },

  verifyRefreshToken: (token: string): RefreshTokenPayload => {
    return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
  },
};
```

### 9.2 R2 Storage Service

```typescript
// services/r2/r2.service.ts
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { env } from '@/config/env';
import { nanoid } from 'nanoid';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

export const r2Service = {
  generateUploadUrl: async (userId: string): Promise<{ uploadUrl: string; key: string }> => {
    const key = `${userId}/${nanoid()}.jpg`;

    const command = new PutObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
      ContentType: 'image/jpeg',
    });

    const uploadUrl = await getSignedUrl(r2Client, command, { expiresIn: 900 }); // 15 min

    return { uploadUrl, key };
  },

  generateViewUrl: async (key: string): Promise<string> => {
    const command = new GetObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
    });

    return getSignedUrl(r2Client, command, { expiresIn: 900 }); // 15 min
  },

  deletePhoto: async (key: string): Promise<void> => {
    const command = new DeleteObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
    });

    await r2Client.send(command);
  },
};
```

### 9.3 Geocoding Service

```typescript
// services/geocoding/geocoding.service.ts
import { geocacheRepository } from '@/repositories/geocache.repository';
import { env } from '@/config/env';

const CACHE_DURATION_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const PRECISION = 4; // ~11m accuracy for cache lookup

export const geocodingService = {
  reverseGeocode: async (lat: number, lng: number): Promise<string | null> => {
    // Round coords for cache lookup
    const roundedLat = Number(lat.toFixed(PRECISION));
    const roundedLng = Number(lng.toFixed(PRECISION));

    // Check cache first
    const cached = await geocacheRepository.findByCoords(roundedLat, roundedLng);
    if (cached && new Date(cached.expiresAt) > new Date()) {
      return cached.address;
    }

    // Fetch from OpenCage API
    const response = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lng}&key=${env.OPENCAGE_API_KEY}`
    );

    if (!response.ok) {
      return null;
    }

    const data = await response.json();
    const address = data.results?.[0]?.formatted || null;

    // Cache the result
    if (address) {
      await geocacheRepository.upsert({
        lat: roundedLat,
        lng: roundedLng,
        address,
        expiresAt: new Date(Date.now() + CACHE_DURATION_MS),
      });
    }

    return address;
  },
};
```

---

## 10. Configuration

### 10.1 Environment Validation

```typescript
// config/env.ts
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),

  // Database
  DATABASE_URL: z.string().url(),

  // JWT
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),

  // OAuth
  GOOGLE_CLIENT_ID: z.string(),
  GOOGLE_CLIENT_SECRET: z.string(),
  APPLE_CLIENT_ID: z.string().optional(),
  APPLE_TEAM_ID: z.string().optional(),
  APPLE_KEY_ID: z.string().optional(),
  APPLE_PRIVATE_KEY: z.string().optional(),

  // R2 Storage
  R2_ACCOUNT_ID: z.string(),
  R2_ACCESS_KEY_ID: z.string(),
  R2_SECRET_ACCESS_KEY: z.string(),
  R2_BUCKET_NAME: z.string(),

  // Geocoding
  OPENCAGE_API_KEY: z.string(),

  // Monitoring
  SENTRY_DSN: z.string().optional(),
});

export const env = envSchema.parse(process.env);
export type Env = z.infer<typeof envSchema>;
```

### 10.2 Database Connection

```typescript
// config/db.ts
import { drizzle } from 'drizzle-orm/neon-http';
import { neon } from '@neondatabase/serverless';
import { env } from './env';
import * as schema from '@repo/shared/db';

const sql = neon(env.DATABASE_URL);
export const db = drizzle(sql, { schema });
```

### 10.3 CORS Configuration

```typescript
// config/cors.ts
import type { CorsOptions } from 'cors';
import { env } from './env';

const allowedOrigins =
  env.NODE_ENV === 'production'
    ? ['https://wheredidipark.app', 'https://www.wheredidipark.app']
    : ['http://localhost:5173', 'http://localhost:3000'];

export const corsConfig: CorsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
```

---

## 11. Testing Strategy

### 11.1 Coverage Targets

| Category     | Target | Tool               |
| ------------ | ------ | ------------------ |
| Services     | 100%   | Vitest             |
| Repositories | 95%    | Vitest             |
| Routes       | 100%   | Vitest + Supertest |
| Middleware   | 95%    | Vitest             |

### 11.2 Test Setup

```typescript
// test/setup.ts
import { beforeAll, afterAll, beforeEach } from 'vitest';
import { db, testDb } from './helpers/testDb';

beforeAll(async () => {
  await testDb.migrate();
});

beforeEach(async () => {
  await testDb.truncateAll();
});

afterAll(async () => {
  await testDb.close();
});
```

### 11.3 Service Test Example

```typescript
// routes/spots/__tests__/spots.service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { spotsService } from '../spots.service';
import { spotRepository } from '@/repositories/spot.repository';
import { NotFoundError } from '@repo/shared/errors';

vi.mock('@/repositories/spot.repository');

describe('spotsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSpotById', () => {
    it('should return spot when found and owned by user', async () => {
      const mockSpot = { id: 'spot-1', userId: 'user-1' };
      vi.mocked(spotRepository.findById).mockResolvedValue(mockSpot as any);

      const result = await spotsService.getSpotById('user-1', 'spot-1');

      expect(result).toEqual(mockSpot);
    });

    it('should throw NotFoundError when spot not found', async () => {
      vi.mocked(spotRepository.findById).mockResolvedValue(null);

      await expect(spotsService.getSpotById('user-1', 'spot-1')).rejects.toThrow(NotFoundError);
    });

    it('should throw AuthorizationError when user does not own spot', async () => {
      const mockSpot = { id: 'spot-1', userId: 'other-user' };
      vi.mocked(spotRepository.findById).mockResolvedValue(mockSpot as any);

      await expect(spotsService.getSpotById('user-1', 'spot-1')).rejects.toThrow('Not authorized');
    });
  });
});
```

### 11.4 Integration Test Example

```typescript
// test/integration/spots.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '@/app';
import { testDb } from '../helpers/testDb';
import { jwtService } from '@/services/jwt/jwt.service';

describe('Spots API', () => {
  const app = createApp();
  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    // Create test user
    const user = await testDb.createUser({ email: 'test@example.com' });
    userId = user.id;
    authToken = jwtService.generateAccessToken(userId, user.email);
  });

  describe('POST /v1/spots', () => {
    it('should create a new parking spot', async () => {
      const response = await request(app)
        .post('/v1/spots')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          latitude: 40.7128,
          longitude: -74.006,
          note: 'Near the entrance',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        latitude: '40.7128000',
        longitude: '-74.0060000',
        note: 'Near the entrance',
        isActive: true,
      });
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/v1/spots')
        .send({ latitude: 40.7128, longitude: -74.006 });

      expect(response.status).toBe(401);
    });
  });
});
```

---

## 12. Coding Standards

### 12.1 Critical Rules

1. ✅ **Types in `types.ts`** per route/service folder
2. ✅ **No try/catch in routes** - let errors propagate to middleware
3. ✅ **Services throw typed errors** - use AppError subclasses
4. ✅ **Repositories return null** - not throw on not found
5. ✅ **Validate all input** - Zod schemas for every endpoint
6. ✅ **Verify ownership** - check userId before any operation

### 12.2 Naming Conventions

| Item         | Convention                     | Example           |
| ------------ | ------------------------------ | ----------------- |
| Routes       | kebab-case file, Router export | `spots.routes.ts` |
| Services     | camelCase object               | `spotsService`    |
| Repositories | camelCase object               | `spotRepository`  |
| Middleware   | camelCase function             | `authMiddleware`  |
| Types        | PascalCase                     | `CreateSpotInput` |
| Env vars     | UPPER_SNAKE                    | `DATABASE_URL`    |

### 12.3 Error Handling Pattern

```typescript
// ✅ DO: Services throw typed errors
async function getSpotById(userId: string, spotId: string) {
  const spot = await spotRepository.findById(spotId);

  if (!spot) {
    throw new NotFoundError('Parking spot');
  }

  if (spot.userId !== userId) {
    throw new AuthorizationError('Not authorized');
  }

  return spot;
}

// ✅ DO: Routes let errors propagate
router.get('/:id', async (req, res) => {
  const spot = await spotsService.getSpotById(req.user!.id, req.params.id);
  res.json({ success: true, data: spot });
});

// ❌ DON'T: Catch errors in routes
router.get('/:id', async (req, res) => {
  try {
    const spot = await spotsService.getSpotById(req.user!.id, req.params.id);
    res.json({ success: true, data: spot });
  } catch (error) {
    // Don't do this - let middleware handle it
  }
});
```

---

## 13. Development Commands

```bash
# Development
pnpm dev              # Start dev server (nodemon)
pnpm build            # TypeScript build
pnpm start            # Production start

# Database
pnpm db:generate      # Generate Drizzle migrations
pnpm db:migrate       # Run migrations
pnpm db:push          # Push schema (dev only)
pnpm db:studio        # Open Drizzle Studio

# Testing
pnpm test             # Run Vitest
pnpm test:watch       # Watch mode
pnpm test:coverage    # With coverage
pnpm test:integration # Integration tests only

# Linting
pnpm lint             # ESLint
pnpm lint:fix         # Fix issues
pnpm typecheck        # TypeScript check
```

---

## 14. Deployment (Vercel)

### 14.1 Vercel Configuration

```json
// vercel.json
{
  "version": 2,
  "builds": [
    {
      "src": "apps/api/src/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/v1/(.*)",
      "dest": "apps/api/src/index.ts"
    },
    {
      "src": "/health",
      "dest": "apps/api/src/index.ts"
    }
  ]
}
```

### 14.2 Environment Variables (Vercel Dashboard)

```
DATABASE_URL=postgres://...
JWT_ACCESS_SECRET=xxx
JWT_REFRESH_SECRET=xxx
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
R2_ACCOUNT_ID=xxx
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=parking-photos
OPENCAGE_API_KEY=xxx
SENTRY_DSN=xxx
```
