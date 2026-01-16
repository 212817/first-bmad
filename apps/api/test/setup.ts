// apps/api/test/setup.ts
import { vi } from 'vitest';

// Mock environment variables for tests
vi.stubEnv('NODE_ENV', 'test');
vi.stubEnv('PORT', '3001');
vi.stubEnv('DATABASE_URL', 'postgres://test:test@localhost:5432/test');
vi.stubEnv('CORS_ORIGINS', 'http://localhost:5173');
