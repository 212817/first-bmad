import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

// Load .env from monorepo root
config({ path: '../../.env', quiet: true });

export default defineConfig({
  schema: '../../packages/shared/src/db/schema.ts',
  out: './drizzle/migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
});
