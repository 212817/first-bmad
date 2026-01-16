# 13. Development Commands

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
