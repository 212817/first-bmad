# Technical Assumptions

### Repository Structure

**Monorepo** — Single repository containing both frontend and backend code. Recommended for solo developer or small team; simplifies deployment and reduces coordination overhead.

### Service Architecture

**Modular Monolith** deployed on serverless/edge platform:

- **Frontend:** React SPA (Vite + TypeScript) hosted on Vercel (static + edge functions)
- **Backend:** Node.js API (Express or Fastify) with TypeScript — can be Vercel serverless functions or separate service on Railway/Render
- **Database:** PostgreSQL on Supabase or Neon (free tier)
- **File Storage:** Cloudflare R2 (S3-compatible, 10GB free)
- **Auth:** OAuth 2.0 via Google and Apple (handled client-side with token validation on backend)

This is effectively a simple 3-tier architecture, not microservices. All backend logic can live in a single deployable unit.

### Language & Tooling

- **TypeScript** for both frontend and backend (strict mode enabled)
- **Vite** as the frontend build tool (fast HMR, optimized builds)
- **ESLint** for code linting (with TypeScript rules)
- **Prettier** for code formatting (consistent style across codebase)
- **Shared ESLint/Prettier config** at monorepo root

### CI/CD Pipeline

**GitHub Actions** (free tier: 2,000 minutes/month for private repos, unlimited for public repos)

**On every Pull Request:**

- Run Prettier check (fail if unformatted code)
- Run ESLint (fail on errors)
- Run unit tests (both FE and BE)
- Build check (ensure TypeScript compiles without errors)

**On merge to main:**

- All PR checks pass (required)
- Auto-deploy to Vercel (frontend + backend)

**Configuration:**

- `.github/workflows/ci.yml` — PR checks workflow
- Branch protection on `main` — require PR checks to pass before merge
- No paid services — GitHub Actions free tier is sufficient for this project

### Testing Requirements

**Unit + Integration Testing:**

- Unit tests for core business logic (spot saving, timer calculations, data transformations)
- Integration tests for API endpoints
- E2E testing for critical flows (save spot, navigate, auth) — can be manual initially
- No requirement for full testing pyramid in MVP; prioritize coverage of core flows

### Additional Technical Assumptions and Requests

- **Cloudflare R2** for photo storage with signed URLs for secure, time-limited access
- **OpenCage API** for reverse geocoding (2,500 req/day free); cache results in database
- **Client-side image compression** using browser Canvas API before upload
- **IndexedDB** for Guest mode local storage
- **JWT tokens** for session management; short expiry with refresh
- **Environment variables** for all secrets and API keys (never committed)
- **CORS** configured appropriately for API access
- **Rate limiting** on API endpoints to prevent abuse
- **Scheduled job** (cron or serverless scheduled function) for photo cleanup when approaching storage limit
- **Type-safe API contracts** — shared types between frontend and backend
- **Strict TypeScript** — `strict: true` in tsconfig for both FE and BE
- **Pre-commit hooks** (optional) — Husky + lint-staged for automated linting/formatting

### Data Model Reference

See [Project Brief - High-Level Data Model](brief.md) for entity definitions:

| Entity          | Key Fields                                                                                |
| --------------- | ----------------------------------------------------------------------------------------- |
| **User**        | id, auth_provider, email, created_at                                                      |
| **ParkingSpot** | id, user_id, lat, lng, saved_at, note, photo_url, meter_expires_at, car_tag, address_text |
| **CarTag**      | id, user_id, name, is_default                                                             |

---
