# 2. Project Structure

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
