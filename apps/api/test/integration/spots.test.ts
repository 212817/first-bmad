// apps/api/test/integration/spots.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

// Use vi.hoisted to define mocks that are available when vi.mock is hoisted
const { mockSpotRepository } = vi.hoisted(() => ({
  mockSpotRepository: {
    create: vi.fn(),
    findById: vi.fn(),
    findByUserId: vi.fn(),
    findActiveByUserId: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../../src/repositories/spot.repository.js', () => ({
  spotRepository: mockSpotRepository,
}));

// Mock the database module
vi.mock('../../src/config/db.js', () => ({
  db: {
    execute: vi.fn(),
    select: vi.fn(() => ({
      from: vi.fn(() => ({
        where: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve([])),
          orderBy: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve([])),
          })),
        })),
      })),
    })),
    insert: vi.fn(() => ({
      values: vi.fn(() => ({
        returning: vi.fn(() => Promise.resolve([])),
      })),
    })),
    update: vi.fn(() => ({
      set: vi.fn(() => ({
        where: vi.fn(() => ({
          returning: vi.fn(() => Promise.resolve([])),
        })),
      })),
    })),
    delete: vi.fn(() => ({
      where: vi.fn(() => ({
        returning: vi.fn(() => Promise.resolve([])),
      })),
    })),
  },
}));

import { createApp } from '../../src/app.js';
import { jwtService } from '../../src/services/jwt/jwt.service.js';

describe('Spots API', () => {
  const app = createApp();
  let validToken: string;
  const userId = 'user-123';
  const userEmail = 'test@example.com';

  const mockSpot = {
    id: 'spot-123',
    userId: userId,
    latitude: 40.7128,
    longitude: -74.006,
    accuracyMeters: 15,
    address: null,
    photoUrl: null,
    note: null,
    floor: null,
    spotIdentifier: null,
    isActive: true,
    savedAt: new Date('2026-01-15T12:00:00Z'),
    createdAt: new Date('2026-01-15T12:00:00Z'),
    updatedAt: new Date('2026-01-15T12:00:00Z'),
  };

  beforeEach(() => {
    vi.resetAllMocks();
    // Generate a valid JWT for testing
    validToken = jwtService.generateAccessToken(userId, userEmail);
  });

  describe('POST /v1/spots', () => {
    it('should return 401 without access token', async () => {
      const response = await request(app).post('/v1/spots').send({ lat: 40.7128, lng: -74.006 });

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
    });

    it('should create a spot with valid data', async () => {
      mockSpotRepository.create.mockResolvedValue(mockSpot);

      const response = await request(app)
        .post('/v1/spots')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ lat: 40.7128, lng: -74.006, accuracyMeters: 15 });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('spot-123');
      expect(response.body.data.lat).toBe(40.7128);
      expect(response.body.data.lng).toBe(-74.006);
    });

    it('should return 400 for invalid latitude', async () => {
      const response = await request(app)
        .post('/v1/spots')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ lat: 91, lng: -74.006 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid longitude', async () => {
      const response = await request(app)
        .post('/v1/spots')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ lat: 40.7128, lng: -181 });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should create an address-only spot without coordinates', async () => {
      const addressOnlySpot = {
        id: 'spot-456',
        userId: userId,
        latitude: null,
        longitude: null,
        accuracyMeters: null,
        address: '123 Main St, Test City',
        photoUrl: null,
        note: null,
        floor: null,
        spotIdentifier: null,
        isActive: true,
        savedAt: new Date('2026-01-15T12:00:00Z'),
        createdAt: new Date('2026-01-15T12:00:00Z'),
        updatedAt: new Date('2026-01-15T12:00:00Z'),
      };
      mockSpotRepository.create.mockResolvedValue(addressOnlySpot);

      const response = await request(app)
        .post('/v1/spots')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ address: '123 Main St, Test City' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('spot-456');
      expect(response.body.data.lat).toBeNull();
      expect(response.body.data.lng).toBeNull();
      expect(response.body.data.address).toBe('123 Main St, Test City');
    });

    it('should create a spot with address and coordinates (geocoded)', async () => {
      const geocodedSpot = {
        id: 'spot-789',
        userId: userId,
        latitude: 40.7128,
        longitude: -74.006,
        accuracyMeters: null,
        address: '123 Main St, New York, NY',
        photoUrl: null,
        note: null,
        floor: null,
        spotIdentifier: null,
        isActive: true,
        savedAt: new Date('2026-01-15T12:00:00Z'),
        createdAt: new Date('2026-01-15T12:00:00Z'),
        updatedAt: new Date('2026-01-15T12:00:00Z'),
      };
      mockSpotRepository.create.mockResolvedValue(geocodedSpot);

      const response = await request(app)
        .post('/v1/spots')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ address: '123 Main St, New York, NY', lat: 40.7128, lng: -74.006 });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.lat).toBe(40.7128);
      expect(response.body.data.lng).toBe(-74.006);
      expect(response.body.data.address).toBe('123 Main St, New York, NY');
    });

    it('should return 400 for address too short', async () => {
      const response = await request(app)
        .post('/v1/spots')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ address: 'ab' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('GET /v1/spots', () => {
    it('should return 401 without access token', async () => {
      const response = await request(app).get('/v1/spots');

      expect(response.status).toBe(401);
    });

    it('should return user spots', async () => {
      mockSpotRepository.findByUserId.mockResolvedValue([mockSpot]);

      const response = await request(app)
        .get('/v1/spots')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.meta.limit).toBe(50);
    });
  });

  describe('GET /v1/spots/active', () => {
    it('should return active spot when exists', async () => {
      mockSpotRepository.findActiveByUserId.mockResolvedValue(mockSpot);

      const response = await request(app)
        .get('/v1/spots/active')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('spot-123');
    });

    it('should return null when no active spot', async () => {
      mockSpotRepository.findActiveByUserId.mockResolvedValue(null);

      const response = await request(app)
        .get('/v1/spots/active')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toBeNull();
    });
  });

  describe('GET /v1/spots/:id', () => {
    it('should return 404 when spot not found', async () => {
      mockSpotRepository.findById.mockResolvedValueOnce(null);

      const response = await request(app)
        .get('/v1/spots/nonexistent')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 403 when accessing another user spot', async () => {
      mockSpotRepository.findById.mockResolvedValueOnce({
        ...mockSpot,
        userId: 'other-user',
      });

      const response = await request(app)
        .get('/v1/spots/spot-123')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('AUTHORIZATION_ERROR');
    });

    it('should return spot when found and owned', async () => {
      mockSpotRepository.findById.mockResolvedValueOnce(mockSpot);

      const response = await request(app)
        .get('/v1/spots/spot-123')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.id).toBe('spot-123');
    });
  });

  describe('PATCH /v1/spots/:id', () => {
    it('should update spot', async () => {
      // First call returns the spot for ownership check
      mockSpotRepository.findById.mockResolvedValueOnce(mockSpot);
      mockSpotRepository.update.mockResolvedValue({
        ...mockSpot,
        note: 'Updated note',
      });

      const response = await request(app)
        .patch('/v1/spots/spot-123')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ note: 'Updated note' });

      expect(response.status).toBe(200);
      expect(response.body.data.note).toBe('Updated note');
    });
  });

  describe('POST /v1/spots/:id/clear', () => {
    it('should clear spot', async () => {
      mockSpotRepository.findById.mockResolvedValueOnce(mockSpot);
      mockSpotRepository.update.mockResolvedValue({
        ...mockSpot,
        isActive: false,
      });

      const response = await request(app)
        .post('/v1/spots/spot-123/clear')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data.isActive).toBe(false);
    });
  });

  describe('DELETE /v1/spots/:id', () => {
    it('should delete spot', async () => {
      mockSpotRepository.findById.mockResolvedValueOnce(mockSpot);
      mockSpotRepository.delete.mockResolvedValue(true);

      const response = await request(app)
        .delete('/v1/spots/spot-123')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(204);
    });
  });
});
