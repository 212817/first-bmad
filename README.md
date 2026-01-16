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

\\\
where-did-i-park/
├── apps/
│ ├── web/ # React PWA
│ └── api/ # Express API
├── packages/
│ └── shared/ # Shared types, schemas, constants
├── .github/workflows/ # CI/CD
├── pnpm-workspace.yaml
├── package.json
├── tsconfig.base.json
└── .env.example
\\\

## Prerequisites

- Node.js 22.x LTS
- pnpm 9.x
- PostgreSQL 17.x (or Neon account)

## Local Development Setup

### 1. Clone and Install

\\\ash
git clone <repo-url>
cd where-did-i-park
pnpm install
\\\

### 2. Environment Variables

Copy the example environment file and fill in your values:

\\\ash
cp .env.example .env
\\\

Required variables:

| Variable        | Description                     | Example                                         |
| --------------- | ------------------------------- | ----------------------------------------------- |
| \DATABASE_URL\  | PostgreSQL connection string    | \postgres://user:pass@host/db?sslmode=require\  |
| \PORT\          | API server port                 | \3001\                                          |
| \NODE_ENV\      | Environment                     | \development\                                   |
| \CORS_ORIGINS\  | Comma-separated allowed origins | \http://localhost:5173\                         |
| \VITE_API_URL\  | API URL for frontend            | \http://localhost:3001\                         |

### 3. Database Setup

Create a Neon database at [neon.tech](https://neon.tech) and add the connection string to \.env\.

Run migrations:

\\\ash
pnpm --filter @repo/api db:push
\\\

### 4. Start Development Servers

Start both frontend and backend:

\\\ash
pnpm dev
\\\

Or start individually:

\\\ash
pnpm dev:web # Frontend at http://localhost:5173
pnpm dev:api # Backend at http://localhost:3001
\\\

### 5. Verify Setup

Test the health endpoint:

\\\ash
curl http://localhost:3001/health
\\\

Expected response:

\\\json
{
\"api\": \"ok\",
\"database\": \"ok\",
\"timestamp\": \"2026-01-16T12:00:00.000Z\"
}
\\\

## Available Scripts

### Root (Monorepo)

| Script               | Description               |
| -------------------- | ------------------------- |
| \pnpm dev\           | Start all dev servers     |
| \pnpm dev:web\       | Start frontend only       |
| \pnpm dev:api\       | Start backend only        |
| \pnpm build\         | Build all packages        |
| \pnpm lint\          | Run ESLint                |
| \pnpm lint:fix\      | Run ESLint with auto-fix  |
| \pnpm format\        | Format code with Prettier |
| \pnpm format:check\  | Check formatting          |
| \pnpm test\          | Run all tests             |
| \pnpm clean\         | Remove build artifacts    |

### Backend (apps/api)

| Script              | Description              |
| ------------------- | ------------------------ |
| \pnpm db:generate\  | Generate migration files |
| \pnpm db:migrate\   | Run migrations           |
| \pnpm db:push\      | Push schema to database  |
| \pnpm db:studio\    | Open Drizzle Studio      |

## Code Quality

### Linting

ESLint 9.x with flat config is used for linting:

\\\ash
pnpm lint # Check for issues
pnpm lint:fix # Auto-fix issues
\\\

### Formatting

Prettier is used for code formatting:

\\\ash
pnpm format # Format all files
pnpm format:check # Check formatting
\\\

## Testing

\\\ash
pnpm test # Run all tests
pnpm --filter @repo/api test:watch # Watch mode for backend
pnpm --filter @repo/web test:watch # Watch mode for frontend
\\\

## CI/CD

GitHub Actions runs on every PR to \main\:

- **Format Check**: Verifies code formatting
- **Lint**: Runs ESLint
- **Build**: Ensures TypeScript compiles
- **Test**: Runs all tests

### Branch Protection Setup

To enable branch protection on \main\:

1. Go to **Settings > Branches** in your GitHub repository
2. Click **Add branch protection rule**
3. Set **Branch name pattern** to \main\
4. Enable:
   - ✅ Require a pull request before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging
5. Select required status checks:
   - \Format Check\
   - \Lint\
   - \Build\
   - \Test\
6. Click **Create**

## Deployment

### Frontend (Vercel)

1. Create a new Vercel project linked to your repository
2. Set root directory to \pps/web\
3. Configure build settings:
   - Build Command: \pnpm build\
   - Output Directory: \dist\
4. Add environment variables:
   - \VITE_API_URL\: Your deployed API URL

### Backend (Vercel Serverless)

1. Create a new Vercel project linked to your repository
2. Set root directory to \pps/api\
3. Add environment variables:
   - \DATABASE_URL\: Neon connection string
   - \NODE_ENV\: \production\
   - \CORS_ORIGINS\: Your frontend URL

Both will auto-deploy on push to \main\.

## License

MIT
