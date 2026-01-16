// apps/api/src/config/env.ts
import { config } from 'dotenv';
import { z } from 'zod';

// Load .env from monorepo root
config({ path: '../../.env' });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string(),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
  API_BASE_URL: z.string().url().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
