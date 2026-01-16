// apps/api/src/routes/health/health.routes.ts
import { Router, type Router as RouterType } from 'express';
import { db } from '../../config/db.js';
import { sql } from 'drizzle-orm';

export const healthRoutes: RouterType = Router();

interface HealthCheck {
  api: string;
  database: string;
  timestamp: string;
}

healthRoutes.get('/', async (_req, res) => {
  const checks: HealthCheck = {
    api: 'ok',
    database: 'unknown',
    timestamp: new Date().toISOString(),
  };

  try {
    await db.execute(sql`SELECT 1`);
    checks.database = 'ok';
  } catch (error) {
    console.error('Database health check failed:', error);
    checks.database = 'error';
  }

  const allHealthy = checks.database === 'ok';
  res.status(allHealthy ? 200 : 503).json(checks);
});
