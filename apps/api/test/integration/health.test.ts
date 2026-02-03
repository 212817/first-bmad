// apps/api/test/integration/health.test.ts
import { describe, it, expect, vi, beforeEach, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { createApp } from '../../src/app.js';
import { db } from '../../src/config/db.js';

// Mock the database module
vi.mock('../../src/config/db.js', () => ({
  db: {
    execute: vi.fn(),
  },
}));

// Cast to access mock methods
const mockExecute = db.execute as ReturnType<typeof vi.fn>;

describe('Health API', () => {
  const app = createApp();
  let consoleSpy: ReturnType<typeof vi.spyOn>;

  beforeAll(() => {
    // Suppress expected console output during tests
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
  });

  afterAll(() => {
    consoleSpy.mockRestore();
  });

  beforeEach(() => {
    vi.clearAllMocks();
    // Re-apply console mock after clearAllMocks
    consoleSpy.mockImplementation(() => { });
    // Default to healthy database
    mockExecute.mockResolvedValue([{ '?column?': 1 }]);
  });

  describe('GET /health', () => {
    it('should return 200 with status ok when database is healthy', async () => {
      const response = await request(app).get('/health');

      expect(response.status).toBe(200);
      expect(response.body.api).toBe('ok');
      expect(response.body.database).toBe('ok');
      expect(response.body.timestamp).toBeDefined();
    });

    it('should return 503 with database error when database is unhealthy', async () => {
      // Simulate database connection failure
      mockExecute.mockRejectedValue(new Error('Connection refused'));

      const response = await request(app).get('/health');

      expect(response.status).toBe(503);
      expect(response.body.api).toBe('ok');
      expect(response.body.database).toBe('error');
      expect(response.body.timestamp).toBeDefined();
    });
  });
});
