// apps/api/test/integration/geocode.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

// Use vi.hoisted to define mocks that are available when vi.mock is hoisted
const { mockGeocodingService, mockGeocacheRepository } = vi.hoisted(() => ({
  mockGeocodingService: {
    geocodeAddress: vi.fn(),
  },
  mockGeocacheRepository: {
    findByAddress: vi.fn(),
    create: vi.fn(),
  },
}));

vi.mock('../../src/services/geocoding/geocoding.service.js', () => ({
  geocodingService: mockGeocodingService,
}));

vi.mock('../../src/repositories/geocache.repository.js', () => ({
  geocacheRepository: mockGeocacheRepository,
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
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() => Promise.resolve([])),
      })),
    })),
  },
}));

import { createApp } from '../../src/app.js';
import { jwtService } from '../../src/services/jwt/jwt.service.js';

describe('Geocode API', () => {
  const app = createApp();
  let validToken: string;
  const userId = 'user-123';
  const userEmail = 'test@example.com';

  beforeEach(() => {
    vi.resetAllMocks();
    // Generate a valid JWT for testing
    validToken = jwtService.generateAccessToken(userId, userEmail);
  });

  describe('POST /v1/geocode', () => {
    it('should return 401 without access token', async () => {
      const response = await request(app).post('/v1/geocode').send({ address: '123 Main St' });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
    });

    it('should return coordinates for valid address', async () => {
      mockGeocodingService.geocodeAddress.mockResolvedValueOnce({
        lat: 40.7128,
        lng: -74.006,
        formattedAddress: '123 Main St, New York, NY 10001, USA',
      });

      const response = await request(app)
        .post('/v1/geocode')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ address: '123 Main St, New York' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual({
        lat: 40.7128,
        lng: -74.006,
        formattedAddress: '123 Main St, New York, NY 10001, USA',
      });
    });

    it('should return 400 for address too short', async () => {
      const response = await request(app)
        .post('/v1/geocode')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ address: 'Hi' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for empty address', async () => {
      const response = await request(app)
        .post('/v1/geocode')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ address: '' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 when address not found', async () => {
      mockGeocodingService.geocodeAddress.mockResolvedValueOnce(null);

      const response = await request(app)
        .post('/v1/geocode')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ address: 'zzznonexistent123xyz' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should include rate limit headers', async () => {
      mockGeocodingService.geocodeAddress.mockResolvedValueOnce({
        lat: 40.7128,
        lng: -74.006,
        formattedAddress: '123 Main St, NY',
      });

      const response = await request(app)
        .post('/v1/geocode')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ address: '123 Main St, New York' });

      expect(response.headers['x-ratelimit-limit']).toBe('10');
      expect(response.headers['x-ratelimit-remaining']).toBeDefined();
      expect(response.headers['x-ratelimit-reset']).toBeDefined();
    });
  });
});
