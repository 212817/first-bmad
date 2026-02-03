// apps/api/test/integration/carTags.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

// Use vi.hoisted to define mocks that are available when vi.mock is hoisted
const { mockCarTagRepository } = vi.hoisted(() => ({
  mockCarTagRepository: {
    getDefaults: vi.fn(),
    findByUserId: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('../../src/repositories/carTag.repository.js', () => ({
  carTagRepository: mockCarTagRepository,
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

describe('Car Tags API', () => {
  const app = createApp();
  let validToken: string;
  const userId = 'user-123';
  const userEmail = 'test@example.com';

  const mockDefaultTag = {
    id: 'default-my-car',
    userId: null,
    name: 'My Car',
    color: '#3B82F6',
    isDefault: true,
    createdAt: new Date('2026-01-01T00:00:00Z'),
  };

  const mockCustomTag = {
    id: 'tag-123',
    userId: userId,
    name: 'Family Van',
    color: '#8B5CF6',
    isDefault: false,
    createdAt: new Date('2026-01-20T10:00:00Z'),
  };

  beforeEach(() => {
    vi.resetAllMocks();
    validToken = jwtService.generateAccessToken(userId, userEmail);
  });

  describe('GET /v1/car-tags', () => {
    it('should return 401 without access token', async () => {
      const response = await request(app).get('/v1/car-tags');

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
    });

    it('should return all tags (defaults + custom)', async () => {
      mockCarTagRepository.getDefaults.mockResolvedValue([mockDefaultTag]);
      mockCarTagRepository.findByUserId.mockResolvedValue([mockCustomTag]);

      const response = await request(app)
        .get('/v1/car-tags')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0].name).toBe('My Car');
      expect(response.body.data[0].isDefault).toBe(true);
      expect(response.body.data[1].name).toBe('Family Van');
      expect(response.body.data[1].isDefault).toBe(false);
    });

    it('should return only defaults when user has no custom tags', async () => {
      mockCarTagRepository.getDefaults.mockResolvedValue([mockDefaultTag]);
      mockCarTagRepository.findByUserId.mockResolvedValue([]);

      const response = await request(app)
        .get('/v1/car-tags')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].isDefault).toBe(true);
    });
  });

  describe('POST /v1/car-tags', () => {
    it('should return 401 without access token', async () => {
      const response = await request(app).post('/v1/car-tags').send({ name: 'Test Tag' });

      expect(response.status).toBe(401);
    });

    it('should create a custom tag', async () => {
      mockCarTagRepository.create.mockResolvedValue(mockCustomTag);

      const response = await request(app)
        .post('/v1/car-tags')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ name: 'Family Van', color: '#8B5CF6' });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Family Van');
      expect(response.body.data.color).toBe('#8B5CF6');
      expect(response.body.data.isDefault).toBe(false);
    });

    it('should return 400 for empty name', async () => {
      const response = await request(app)
        .post('/v1/car-tags')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ name: '' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 400 for invalid color format', async () => {
      const response = await request(app)
        .post('/v1/car-tags')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ name: 'Test', color: 'invalid' });

      expect(response.status).toBe(400);
      expect(response.body.error.code).toBe('VALIDATION_ERROR');
    });
  });

  describe('PATCH /v1/car-tags/:id', () => {
    it('should return 401 without access token', async () => {
      const response = await request(app).patch('/v1/car-tags/tag-123').send({ name: 'Updated' });

      expect(response.status).toBe(401);
    });

    it('should update a custom tag', async () => {
      const updatedTag = { ...mockCustomTag, name: 'Updated Name' };
      mockCarTagRepository.findById.mockResolvedValue(mockCustomTag);
      mockCarTagRepository.update.mockResolvedValue(updatedTag);

      const response = await request(app)
        .patch('/v1/car-tags/tag-123')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ name: 'Updated Name' });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Name');
    });

    it('should return 404 for non-existent tag', async () => {
      mockCarTagRepository.findById.mockResolvedValue(null);

      const response = await request(app)
        .patch('/v1/car-tags/nonexistent')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ name: 'Updated' });

      expect(response.status).toBe(404);
      expect(response.body.error.code).toBe('NOT_FOUND');
    });

    it('should return 403 when trying to edit default tag', async () => {
      mockCarTagRepository.findById.mockResolvedValue(mockDefaultTag);

      const response = await request(app)
        .patch('/v1/car-tags/default-my-car')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ name: 'Hacked' });

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('AUTHORIZATION_ERROR');
    });

    it('should return 403 when trying to edit another user tag', async () => {
      const otherUserTag = { ...mockCustomTag, userId: 'other-user' };
      mockCarTagRepository.findById.mockResolvedValue(otherUserTag);

      const response = await request(app)
        .patch('/v1/car-tags/tag-123')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ name: 'Hacked' });

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('AUTHORIZATION_ERROR');
    });
  });

  describe('DELETE /v1/car-tags/:id', () => {
    it('should return 401 without access token', async () => {
      const response = await request(app).delete('/v1/car-tags/tag-123');

      expect(response.status).toBe(401);
    });

    it('should delete a custom tag', async () => {
      mockCarTagRepository.findById.mockResolvedValue(mockCustomTag);
      mockCarTagRepository.delete.mockResolvedValue(true);

      const response = await request(app)
        .delete('/v1/car-tags/tag-123')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(204);
    });

    it('should return 404 for non-existent tag', async () => {
      mockCarTagRepository.findById.mockResolvedValue(null);

      const response = await request(app)
        .delete('/v1/car-tags/nonexistent')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(404);
    });

    it('should return 403 when trying to delete default tag', async () => {
      mockCarTagRepository.findById.mockResolvedValue(mockDefaultTag);

      const response = await request(app)
        .delete('/v1/car-tags/default-my-car')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(403);
      expect(response.body.error.code).toBe('AUTHORIZATION_ERROR');
    });

    it('should return 403 when trying to delete another user tag', async () => {
      const otherUserTag = { ...mockCustomTag, userId: 'other-user' };
      mockCarTagRepository.findById.mockResolvedValue(otherUserTag);

      const response = await request(app)
        .delete('/v1/car-tags/tag-123')
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(403);
    });
  });
});
