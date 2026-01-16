// apps/api/test/integration/health.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';

// Mock the database module
vi.mock('../../src/config/db.js', () => ({
  db: {
    execute: vi.fn().mockResolvedValue([{ '?column?': 1 }]),
  },
}));

describe('Health API', () => {
  const app = createApp();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /health', () => {
    it('should return 200 with status ok when database is healthy', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.api).toBe('ok');
      expect(response.body.database).toBe('ok');
      expect(response.body.timestamp).toBeDefined();
    });
  });
});
