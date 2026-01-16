// apps/api/src/config/env.ts
import { config } from 'dotenv';
import { z } from 'zod';

// Load .env from monorepo root
config({ path: '../../.env' });

// Check if we're in test mode
const isTest = process.env.NODE_ENV === 'test';

// Test defaults for sensitive values (only used in test environment)
const TEST_SECRET = 'test-secret-at-least-32-characters-long';
const TEST_GOOGLE_ID = 'test-client-id';
const TEST_GOOGLE_SECRET = 'test-client-secret';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(3001),
  DATABASE_URL: z.string(),
  CORS_ORIGINS: z.string().default('http://localhost:5173'),
  API_BASE_URL: z.string().url().optional(),
  // Google OAuth - use test defaults in test environment
  GOOGLE_CLIENT_ID: z
    .string()
    .min(1, 'GOOGLE_CLIENT_ID is required')
    .default(isTest ? TEST_GOOGLE_ID : ''),
  GOOGLE_CLIENT_SECRET: z
    .string()
    .min(1, 'GOOGLE_CLIENT_SECRET is required')
    .default(isTest ? TEST_GOOGLE_SECRET : ''),
  // JWT Secrets - use test defaults in test environment
  JWT_ACCESS_SECRET: z
    .string()
    .min(32, 'JWT_ACCESS_SECRET must be at least 32 characters')
    .default(isTest ? TEST_SECRET : ''),
  JWT_REFRESH_SECRET: z
    .string()
    .min(32, 'JWT_REFRESH_SECRET must be at least 32 characters')
    .default(isTest ? TEST_SECRET : ''),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
export type Env = z.infer<typeof envSchema>;
