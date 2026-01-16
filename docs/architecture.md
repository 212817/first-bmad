# Where Did I Park? - System Architecture

> **Version:** 1.0.0  
> **Based on:** PRD v1.2  
> **Created:** 2026-01-15  
> **Status:** Complete

## Related Documents

- [Frontend Architecture](./architecture-frontend.md) - React PWA details
- [Backend Architecture](./architecture-backend.md) - API & Database details
- [PRD](./prd.md) - Product Requirements

---

## 1. Introduction

### 1.1 Project Type

- **Greenfield** - New application, no existing codebase
- **No starter template** - Custom setup for full control

### 1.2 Document Purpose

This document defines the shared architectural decisions, API contracts, and system-wide patterns for the "Where Did I Park?" PWA application.

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           SYSTEM OVERVIEW                                │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│    ┌──────────────┐         ┌──────────────┐         ┌──────────────┐   │
│    │   Browser    │         │   Vercel     │         │    Neon      │   │
│    │   (PWA)      │◄───────►│   Functions  │◄───────►│  PostgreSQL  │   │
│    │   React 19   │  REST   │   Express 5  │  Drizzle│    17.x      │   │
│    └──────────────┘         └──────────────┘         └──────────────┘   │
│           │                        │                                     │
│           │                        │                                     │
│           ▼                        ▼                                     │
│    ┌──────────────┐         ┌──────────────┐                            │
│    │ localStorage │         │ Cloudflare   │                            │
│    │ (offline)    │         │     R2       │                            │
│    └──────────────┘         │  (photos)    │                            │
│                             └──────────────┘                            │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 2.1 Platform Choice

| Component            | Service          | Tier | Limit                |
| -------------------- | ---------------- | ---- | -------------------- |
| Frontend Hosting     | Vercel           | Free | 100GB bandwidth      |
| Backend (Serverless) | Vercel Functions | Free | 100GB-hrs            |
| Database             | Neon PostgreSQL  | Free | 0.5GB storage        |
| Photo Storage        | Cloudflare R2    | Free | 10GB, no egress fees |
| Auth Provider        | Google/Apple     | Free | Unlimited            |
| CI/CD                | GitHub Actions   | Free | 2000 min/month       |

**Total Monthly Cost: $0**

### 2.2 Key Architectural Patterns

| Pattern                | Usage                                     |
| ---------------------- | ----------------------------------------- |
| **Monorepo**           | pnpm workspaces - shared types/validation |
| **REST API**           | JSON over HTTPS, JWT auth                 |
| **Repository Pattern** | Data access abstraction                   |
| **Service Layer**      | Business logic isolation                  |
| **Optimistic Updates** | Instant UI feedback                       |
| **Signed URLs**        | Secure photo access                       |

---

## 3. Tech Stack Overview

### 3.1 Full Stack Versions

| Layer        | Technology   | Version           |
| ------------ | ------------ | ----------------- |
| **Frontend** | React        | 19.x              |
|              | Vite         | 6.x               |
|              | TypeScript   | 5.7.x             |
|              | Tailwind CSS | 4.x               |
|              | Zustand      | 5.x               |
| **Backend**  | Node.js      | 22.x LTS          |
|              | Express      | 5.x               |
|              | Drizzle ORM  | 0.38.x            |
| **Database** | PostgreSQL   | 17.x              |
| **Testing**  | Vitest       | 3.x               |
|              | Playwright   | 1.50.x            |
| **Tooling**  | pnpm         | 9.x               |
|              | ESLint       | 9.x (flat config) |

---

## 4. Data Models

### 4.1 Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────────┐       ┌─────────────┐
│    User     │       │   ParkingSpot   │       │   CarTag    │
├─────────────┤       ├─────────────────┤       ├─────────────┤
│ id (PK)     │──────<│ userId (FK)     │       │ id (PK)     │
│ email       │       │ id (PK)         │>──────│ spotId (FK) │
│ displayName │       │ latitude        │       │ label       │
│ avatarUrl   │       │ longitude       │       │ createdAt   │
│ provider    │       │ address         │       └─────────────┘
│ providerId  │       │ photoUrl        │
│ createdAt   │       │ note            │
│ updatedAt   │       │ floor           │
│ lastLoginAt │       │ spotIdentifier  │
└─────────────┘       │ isActive        │
                      │ createdAt       │
                      │ updatedAt       │
                      └─────────────────┘
                             │
                             │
                      ┌──────▼──────┐
                      │GeocodingCache│
                      ├─────────────┤
                      │ id (PK)     │
                      │ lat         │
                      │ lng         │
                      │ address     │
                      │ createdAt   │
                      │ expiresAt   │
                      └─────────────┘
```

### 4.2 TypeScript Interfaces (Shared)

```typescript
// packages/shared/src/types/models.ts

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  provider: 'google' | 'apple';
  providerId: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
}

export interface ParkingSpot {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  address: string | null;
  photoUrl: string | null;
  note: string | null;
  floor: string | null;
  spotIdentifier: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CarTag {
  id: string;
  spotId: string;
  label: string;
  createdAt: Date;
}

export interface GeocodingCache {
  id: string;
  lat: number;
  lng: number;
  address: string;
  createdAt: Date;
  expiresAt: Date;
}
```

---

## 5. API Specification

### 5.1 Base Configuration

```yaml
openapi: 3.1.0
info:
  title: Where Did I Park API
  version: 1.0.0
servers:
  - url: https://api.wheredidipark.app/v1
    description: Production
  - url: http://localhost:3001/v1
    description: Development
```

### 5.2 Authentication Endpoints

| Method | Endpoint                | Description              |
| ------ | ----------------------- | ------------------------ |
| GET    | `/auth/google`          | Initiate Google OAuth    |
| GET    | `/auth/google/callback` | Google OAuth callback    |
| GET    | `/auth/apple`           | Initiate Apple Sign-In   |
| POST   | `/auth/apple/callback`  | Apple Sign-In callback   |
| POST   | `/auth/refresh`         | Refresh access token     |
| POST   | `/auth/logout`          | Invalidate refresh token |
| GET    | `/auth/me`              | Get current user         |

### 5.3 Parking Spot Endpoints

| Method | Endpoint           | Description                   |
| ------ | ------------------ | ----------------------------- |
| POST   | `/spots`           | Save new parking spot         |
| GET    | `/spots`           | List user's spots (paginated) |
| GET    | `/spots/active`    | Get active spot               |
| GET    | `/spots/:id`       | Get spot by ID                |
| PATCH  | `/spots/:id`       | Update spot                   |
| DELETE | `/spots/:id`       | Delete spot                   |
| POST   | `/spots/:id/clear` | Mark spot as cleared          |

### 5.4 Photo Endpoints

| Method | Endpoint             | Description           |
| ------ | -------------------- | --------------------- |
| POST   | `/photos/upload-url` | Get signed upload URL |
| DELETE | `/photos/:key`       | Delete photo from R2  |

### 5.5 Geocoding Endpoints

| Method | Endpoint           | Description                         |
| ------ | ------------------ | ----------------------------------- |
| GET    | `/geocode/reverse` | Reverse geocode (lat/lng → address) |

### 5.6 Standard Response Formats

**Success Response:**

```typescript
interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}
```

**Error Response:**

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}
```

### 5.7 Error Codes

| Code                   | HTTP Status | Description           |
| ---------------------- | ----------- | --------------------- |
| `VALIDATION_ERROR`     | 400         | Invalid request data  |
| `AUTHENTICATION_ERROR` | 401         | Missing/invalid token |
| `AUTHORIZATION_ERROR`  | 403         | Not allowed           |
| `NOT_FOUND`            | 404         | Resource not found    |
| `CONFLICT`             | 409         | Resource conflict     |
| `RATE_LIMIT_EXCEEDED`  | 429         | Too many requests     |
| `INTERNAL_ERROR`       | 500         | Server error          |

---

## 6. External Services

### 6.1 Service Configuration

| Service                | Purpose        | Rate Limit         | Fallback           |
| ---------------------- | -------------- | ------------------ | ------------------ |
| **Google OAuth 2.0**   | Authentication | Unlimited          | Apple Sign-In      |
| **Apple Sign-In**      | Authentication | Unlimited          | Google OAuth       |
| **OpenCage Geocoding** | Address lookup | 2,500/day free     | Return coords only |
| **Cloudflare R2**      | Photo storage  | 10M req/month      | Disable photos     |
| **Neon PostgreSQL**    | Database       | Connection pooling | N/A (critical)     |

### 6.2 Environment Variables

```bash
# Shared
NODE_ENV=production

# Auth
GOOGLE_CLIENT_ID=xxx
GOOGLE_CLIENT_SECRET=xxx
APPLE_CLIENT_ID=xxx
APPLE_TEAM_ID=xxx
APPLE_KEY_ID=xxx
APPLE_PRIVATE_KEY=xxx

# JWT
JWT_ACCESS_SECRET=xxx
JWT_REFRESH_SECRET=xxx
JWT_ACCESS_EXPIRES=15m
JWT_REFRESH_EXPIRES=7d

# Database
DATABASE_URL=postgres://...

# Storage
R2_ACCOUNT_ID=xxx
R2_ACCESS_KEY_ID=xxx
R2_SECRET_ACCESS_KEY=xxx
R2_BUCKET_NAME=parking-photos
R2_PUBLIC_URL=https://photos.wheredidipark.app

# Geocoding
OPENCAGE_API_KEY=xxx

# Frontend (VITE_ prefix)
VITE_API_URL=https://api.wheredidipark.app
VITE_GOOGLE_CLIENT_ID=xxx
VITE_SENTRY_DSN=xxx
```

---

## 7. Core Workflows

### 7.1 Authentication Flow

```
┌────────┐     ┌────────┐     ┌────────┐     ┌────────┐
│  User  │     │  PWA   │     │  API   │     │ Google │
└───┬────┘     └───┬────┘     └───┬────┘     └───┬────┘
    │              │              │              │
    │ Click Login  │              │              │
    │─────────────>│              │              │
    │              │              │              │
    │              │ GET /auth/google            │
    │              │─────────────>│              │
    │              │              │              │
    │              │   Redirect   │              │
    │              │<─────────────│              │
    │              │              │              │
    │         Redirect to Google consent        │
    │<─────────────────────────────────────────>│
    │              │              │              │
    │              │  Callback with code         │
    │              │─────────────>│              │
    │              │              │              │
    │              │              │ Exchange code│
    │              │              │─────────────>│
    │              │              │              │
    │              │              │ User info    │
    │              │              │<─────────────│
    │              │              │              │
    │              │ Set cookies (access+refresh)│
    │              │<─────────────│              │
    │              │              │              │
    │  Redirect to app            │              │
    │<─────────────│              │              │
```

### 7.2 Save Parking Spot Flow

```
┌────────┐     ┌────────┐     ┌────────┐     ┌────────┐     ┌────────┐
│  User  │     │  PWA   │     │  API   │     │   R2   │     │  Neon  │
└───┬────┘     └───┬────┘     └───┬────┘     └───┬────┘     └───┬────┘
    │              │              │              │              │
    │ Tap "Park"   │              │              │              │
    │─────────────>│              │              │              │
    │              │              │              │              │
    │              │ Get GPS coords              │              │
    │              │──────────────────────────────────────────> │
    │              │              │              │              │
    │              │ POST /photos/upload-url     │              │
    │              │─────────────>│              │              │
    │              │              │              │              │
    │              │ Signed URL   │              │              │
    │              │<─────────────│              │              │
    │              │              │              │              │
    │              │ PUT photo    │              │              │
    │              │─────────────────────────────>              │
    │              │              │              │              │
    │              │ POST /spots  │              │              │
    │              │─────────────>│              │              │
    │              │              │              │              │
    │              │              │ INSERT spot  │              │
    │              │              │─────────────────────────────>
    │              │              │              │              │
    │              │ 201 Created  │              │              │
    │              │<─────────────│              │              │
    │              │              │              │              │
    │ Show success │              │              │              │
    │<─────────────│              │              │              │
```

### 7.3 Navigate to Car Flow

```
┌────────┐     ┌────────┐     ┌────────┐
│  User  │     │  PWA   │     │  Maps  │
└───┬────┘     └───┬────┘     └───┬────┘
    │              │              │
    │ Tap Navigate │              │
    │─────────────>│              │
    │              │              │
    │              │ Get current location
    │              │──────────────────────────>
    │              │              │
    │              │ Build maps URL
    │              │ (dest=spot coords)
    │              │              │
    │              │ Open external
    │              │─────────────>│
    │              │              │
    │   Maps app opens with directions
    │<─────────────────────────────
```

---

## 8. Project Structure (Monorepo)

```
where-did-i-park/
├── apps/
│   ├── web/                      # React PWA (see architecture-frontend.md)
│   └── api/                      # Express API (see architecture-backend.md)
├── packages/
│   └── shared/                   # Shared code
│       ├── src/
│       │   ├── types/            # Shared TypeScript types
│       │   │   ├── models.ts     # User, ParkingSpot, CarTag
│       │   │   ├── api.ts        # Request/Response types
│       │   │   └── index.ts
│       │   ├── validation/       # Zod schemas
│       │   │   ├── spot.ts
│       │   │   ├── auth.ts
│       │   │   └── index.ts
│       │   ├── constants/        # Shared constants
│       │   │   ├── limits.ts
│       │   │   └── index.ts
│       │   ├── errors/           # Error classes
│       │   │   └── index.ts
│       │   └── db/               # Drizzle schema (BE only)
│       │       ├── schema.ts
│       │       └── index.ts
│       ├── package.json
│       └── tsconfig.json
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
└── .env.example
```

---

## 9. Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                     DEPLOYMENT PIPELINE                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────┐    ┌──────────┐    ┌──────────┐    ┌──────────┐ │
│   │  GitHub  │───>│  GitHub  │───>│  Vercel  │───>│Production│ │
│   │   Push   │    │ Actions  │    │  Build   │    │  Deploy  │ │
│   └──────────┘    └──────────┘    └──────────┘    └──────────┘ │
│                         │                                        │
│                         ▼                                        │
│                   ┌──────────┐                                   │
│                   │  Tests   │                                   │
│                   │  Lint    │                                   │
│                   │TypeCheck │                                   │
│                   └──────────┘                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 9.1 Branch Strategy

| Branch      | Environment | Auto-deploy |
| ----------- | ----------- | ----------- |
| `main`      | Production  | Yes         |
| `dev`       | Preview     | Yes         |
| `feature/*` | Preview     | Yes         |

---

## 10. Security Overview

### 10.1 Security Layers

| Layer              | Measures                                     |
| ------------------ | -------------------------------------------- |
| **Transport**      | HTTPS only, HSTS                             |
| **Authentication** | OAuth 2.0, JWT (15min access, 7d refresh)    |
| **Authorization**  | User owns only their data                    |
| **API**            | Rate limiting, input validation (Zod)        |
| **Storage**        | Signed URLs (15min expiry)                   |
| **Headers**        | CSP, X-Frame-Options, X-Content-Type-Options |

### 10.2 Content Security Policy

```
default-src 'self';
script-src 'self';
style-src 'self' 'unsafe-inline';
img-src 'self' https://*.r2.cloudflarestorage.com data:;
connect-src 'self' https://api.wheredidipark.app;
```

---

## 11. Monitoring Overview

| Tool             | Purpose        | Free Tier          |
| ---------------- | -------------- | ------------------ |
| Vercel Analytics | Web vitals     | 2,500 events/month |
| Vercel Logs      | Function logs  | 1 day retention    |
| Sentry           | Error tracking | 5K errors/month    |
| Uptime Robot     | Health checks  | 50 monitors        |
| Neon Dashboard   | DB metrics     | Built-in           |

---

## 12. Checklist Results

| #   | Check Item                   | Status |
| --- | ---------------------------- | ------ |
| 1   | All PRD requirements mapped  | ✅     |
| 2   | Data models complete         | ✅     |
| 3   | API endpoints defined        | ✅     |
| 4   | Auth flow complete           | ✅     |
| 5   | Security measures documented | ✅     |
| 6   | Performance targets set      | ✅     |
| 7   | Testing strategy complete    | ✅     |
| 8   | Deployment pipeline defined  | ✅     |
| 9   | Cost constraints met ($0/mo) | ✅     |

---

## 13. Key Decisions Summary

| Decision  | Choice             | Rationale               |
| --------- | ------------------ | ----------------------- |
| Platform  | Vercel + Neon + R2 | Zero cost, excellent DX |
| Monorepo  | pnpm workspaces    | Shared types/validation |
| Auth      | OAuth + JWT        | No password management  |
| API Style | REST               | Simple, well-understood |
| State     | Zustand            | Minimal boilerplate     |
| ORM       | Drizzle            | Type-safe, lightweight  |

---

## 14. User Customizations Applied

1. ✅ **Latest stable versions** - React 19, Vite 6, TypeScript 5.7
2. ✅ **Types organization** - Single `types.ts` per folder
3. ✅ **Hooks structure** - Each hook in own folder
4. ✅ **Tailwind CSS** - For all styling
5. ✅ **ErrorBoundaries** - Hierarchical error isolation
6. ✅ **High test coverage** - 95-100% targets
7. ✅ **No premature memoization** - Avoid `useCallback`/`useMemo`
