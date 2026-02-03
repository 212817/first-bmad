# Where Did I Park?

Never forget where you parked again. A PWA for saving and finding your parking spot.

[![CI](https://github.com/212817/first-bmad/actions/workflows/ci.yml/badge.svg)](https://github.com/212817/first-bmad/actions/workflows/ci.yml)

## Tech Stack

| Layer    | Technology   | Version           |
| -------- | ------------ | ----------------- |
| Frontend | React        | 19.x              |
|          | Vite         | 6.x               |
|          | TypeScript   | 5.7.x             |
|          | Tailwind CSS | 4.x               |
|          | Zustand      | 5.x               |
| Backend  | Node.js      | 22.x LTS          |
|          | Express      | 5.x               |
|          | Drizzle ORM  | 0.38.x            |
| Database | PostgreSQL   | 17.x (Neon)       |
| Testing  | Vitest       | 3.x               |
| Tooling  | pnpm         | 9.x               |
|          | ESLint       | 9.x (flat config) |

## Project Structure

```
where-did-i-park/
├── apps/
│   ├── web/                 # React PWA
│   └── api/                 # Express API
├── packages/
│   └── shared/              # Shared types, schemas, constants
├── .github/workflows/       # CI/CD
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
└── .env.example
```

## Prerequisites

- Node.js 22.x LTS
- pnpm 9.x
- PostgreSQL 17.x (or Neon account)

## Local Development Setup

### 1. Clone and Install

```bash
git clone <repo-url>
cd where-did-i-park
pnpm install
```

### 2. Environment Variables

Copy the example environment file and fill in your values:

```bash
cp .env.example .env
```

Required variables:

| Variable       | Description                     | Example                                        |
| -------------- | ------------------------------- | ---------------------------------------------- |
| `DATABASE_URL` | PostgreSQL connection string    | `postgres://user:pass@host/db?sslmode=require` |
| `PORT`         | API server port                 | `3001`                                         |
| `NODE_ENV`     | Environment                     | `development`                                  |
| `CORS_ORIGINS` | Comma-separated allowed origins | `http://localhost:5173`                        |
| `VITE_API_URL` | API URL for frontend            | `http://localhost:3001`                        |

#### External Services (Optional)

| Variable               | Description                      | How to Get                                                                    |
| ---------------------- | -------------------------------- | ----------------------------------------------------------------------------- |
| `OPENCAGE_API_KEY`     | Geocoding API for address lookup | Sign up at [opencagedata.com](https://opencagedata.com/) (2,500 req/day free) |
| `R2_ACCOUNT_ID`        | Cloudflare R2 for photo storage  | Cloudflare Dashboard > R2                                                     |
| `R2_ACCESS_KEY_ID`     | R2 API access key                | R2 > Manage R2 API Tokens                                                     |
| `R2_SECRET_ACCESS_KEY` | R2 API secret key                | R2 > Manage R2 API Tokens                                                     |
| `R2_BUCKET_NAME`       | R2 bucket name                   | Create in Cloudflare R2                                                       |
| `R2_PUBLIC_URL`        | Public URL for R2 bucket         | R2 bucket settings                                                            |

### 3. Database Setup

Create a Neon database at [neon.tech](https://neon.tech) and add the connection string to `.env`.

Run migrations:

```bash
pnpm --filter @repo/api db:push
```

### 4. Start Development Servers

Start both frontend and backend:

```bash
pnpm dev
```

Or start individually:

```bash
pnpm dev:web  # Frontend at http://localhost:5173
pnpm dev:api  # Backend at http://localhost:3001
```

### 5. Verify Setup

Test the health endpoint:

```bash
curl http://localhost:3001/health
```

Expected response:

```json
{
  "api": "ok",
  "database": "ok",
  "timestamp": "2026-01-16T12:00:00.000Z"
}
```

## Available Scripts

### Root (Monorepo)

| Script              | Description               |
| ------------------- | ------------------------- |
| `pnpm dev`          | Start all dev servers     |
| `pnpm dev:web`      | Start frontend only       |
| `pnpm dev:api`      | Start backend only        |
| `pnpm build`        | Build all packages        |
| `pnpm lint`         | Run ESLint                |
| `pnpm lint:fix`     | Run ESLint with auto-fix  |
| `pnpm format`       | Format code with Prettier |
| `pnpm format:check` | Check formatting          |
| `pnpm test`         | Run all tests             |
| `pnpm clean`        | Remove build artifacts    |

### Backend (apps/api)

| Script             | Description              |
| ------------------ | ------------------------ |
| `pnpm db:generate` | Generate migration files |
| `pnpm db:migrate`  | Run migrations           |
| `pnpm db:push`     | Push schema to database  |
| `pnpm db:studio`   | Open Drizzle Studio      |

## Code Quality

### Linting

ESLint 9.x with flat config is used for linting:

```bash
pnpm lint      # Check for issues
pnpm lint:fix  # Auto-fix issues
```

### Formatting

Prettier is used for code formatting:

```bash
pnpm format        # Format all files
pnpm format:check  # Check formatting
```

## Testing

```bash
pnpm test                            # Run all tests
pnpm --filter @repo/api test:watch   # Watch mode for backend
pnpm --filter @repo/web test:watch   # Watch mode for frontend
```

## CI/CD

GitHub Actions runs on every push and PR to `main`:

- **Format Check**: Verifies code formatting
- **Lint**: Runs ESLint
- **TypeScript Check**: Type checking
- **Build**: Ensures code compiles
- **Test**: Runs all unit tests
- **E2E Tests**: Runs Playwright tests (on PRs only)

### Branch Protection Setup

To enable branch protection on `main`:

1. Go to **Settings > Branches** in your GitHub repository
2. Click **Add branch protection rule**
3. Set **Branch name pattern** to `main`
4. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
5. Select required status checks:
   - `Format Check`
   - `Lint`
   - `TypeScript Check`
   - `Build`
   - `Test`
6. Click **Create**

## Deployment

### Frontend (Vercel)

**Live URL**: <https://first-bmad.vercel.app>

The frontend is configured to deploy from the monorepo root using `vercel.json`:

```bash
vercel --prod  # Deploy from repo root
```

Or connect to GitHub for auto-deploy:

1. Go to [vercel.com](https://vercel.com) and import your repository
2. Environment variables will be read from `vercel.json`
3. Add `VITE_API_URL` pointing to your API

### Backend (Recommended: Railway or Render)

For Express APIs in a pnpm monorepo, Railway or Render provide better DX:

#### Railway

1. Create new project at [railway.app](https://railway.app)
2. Connect your GitHub repository
3. Set root directory to `/apps/api`
4. Add environment variables:
   - `DATABASE_URL`: Neon connection string
   - `NODE_ENV`: `production`
   - `CORS_ORIGINS`: Your frontend URL
   - `PORT`: `3001` (or auto-assigned)

#### Render

1. Create new Web Service at [render.com](https://render.com)
2. Connect your GitHub repository
3. Set root directory to `apps/api`
4. Build command: `cd ../.. && npm i -g pnpm && pnpm install && pnpm build`
5. Start command: `node dist/index.js`

### Local Development Only

For now, run the API locally while the frontend is deployed:

```bash
pnpm dev:api  # Run API at localhost:3001
```

## Authentication

The app supports multiple authentication options:

### Google OAuth

Sign in with your Google account to sync your parking spots across devices.

### Guest Mode

Use the app without creating an account:

- **No sign-up required**: Click "Continue as Guest" on the login page
- **Local storage only**: All data is stored in your browser using IndexedDB
- **Persistent**: Guest session persists across browser refreshes and restarts
- **Upgrade anytime**: Sign in later to sync your spots to the cloud

When in guest mode:

- A yellow banner displays "Guest Mode - Data stored locally only"
- After 3 visits, a prompt encourages signing in to enable sync
- Data remains on your device until you clear browser storage

**Technical Details:**

- Guest sessions use IndexedDB with database name `wdip-local`
- A unique session ID (UUID) is generated for potential future migration
- Guest mode state is hydrated on app load before rendering

## License

MIT
