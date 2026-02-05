// apps/api/test/integration/share.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

// Mock shareTokenRepository
const mockShareTokenRepository = vi.hoisted(() => ({
  findByToken: vi.fn(),
}));

vi.mock('../../src/repositories/shareToken.repository.js', () => ({
  shareTokenRepository: mockShareTokenRepository,
}));

// Mock the database module
vi.mock('../../src/config/db.js', () => ({
  db: {
    execute: vi.fn(),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([])),
        })),
      })),
    })),
  },
}));

import { createApp } from '../../src/app.js';

describe('Share Routes (Public)', () => {
  const app = createApp();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /v1/share/:token', () => {
    const mockSpot = {
      id: 'spot-123',
      userId: 'user-456',
      latitude: 40.7128,
      longitude: -74.006,
      address: '123 Main St, New York, NY',
      photoUrl: 'https://example.com/photo.jpg',
      note: 'Near the elevator',
      floor: 'B2',
      spotIdentifier: 'A-15',
      isActive: true,
      carTagId: 'tag-123',
      accuracyMeters: null,
      savedAt: new Date('2026-01-15T10:00:00Z'),
      updatedAt: new Date('2026-01-15T10:00:00Z'),
    };

    const mockShareToken = {
      id: 'share-token-id',
      token: 'valid-token-123',
      spotId: 'spot-123',
      createdAt: new Date('2026-01-15T10:00:00Z'),
      expiresAt: new Date('2026-01-22T10:00:00Z'),
      spot: mockSpot,
    };

    it('should return shared spot data for valid token', async () => {
      mockShareTokenRepository.findByToken.mockResolvedValue(mockShareToken);

      const response = await request(app)
        .get('/v1/share/valid-token-123')
        .expect('Content-Type', /json/)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        id: 'spot-123',
        lat: 40.7128,
        lng: -74.006,
        address: '123 Main St, New York, NY',
        photoUrl: 'https://example.com/photo.jpg',
        note: 'Near the elevator',
        floor: 'B2',
        spotIdentifier: 'A-15',
      });
      // Should NOT include userId
      expect(response.body.data.userId).toBeUndefined();
      expect(mockShareTokenRepository.findByToken).toHaveBeenCalledWith('valid-token-123');
    });

    it('should return 404 for expired or invalid token', async () => {
      mockShareTokenRepository.findByToken.mockResolvedValue(null);

      const response = await request(app)
        .get('/v1/share/invalid-token')
        .expect('Content-Type', /json/)
        .expect(404);

      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should not require authentication', async () => {
      mockShareTokenRepository.findByToken.mockResolvedValue(mockShareToken);

      // No Authorization header - should still work
      const response = await request(app).get('/v1/share/valid-token-123').expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should include expiresAt in response', async () => {
      mockShareTokenRepository.findByToken.mockResolvedValue(mockShareToken);

      const response = await request(app).get('/v1/share/valid-token-123').expect(200);

      expect(response.body.data.expiresAt).toBe('2026-01-22T10:00:00.000Z');
    });
  });
});
