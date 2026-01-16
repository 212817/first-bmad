// apps/api/src/config/db.ts
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { env } from './env.js';

const sql = neon(env.DATABASE_URL);
export const db = drizzle(sql);

export type Database = typeof db;
