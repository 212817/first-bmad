// apps/api/test/integration/photos.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';

// Use vi.hoisted to define mocks that are available when vi.mock is hoisted
const { mockR2Service } = vi.hoisted(() => ({
  mockR2Service: {
    generatePhotoKey: vi.fn(),
    generateUploadUrl: vi.fn(),
    generateDownloadUrl: vi.fn(),
    deleteObject: vi.fn(),
  },
}));

vi.mock('../../src/services/r2/r2.service.js', () => ({
  r2Service: mockR2Service,
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

describe('Photos API', () => {
  const app = createApp();
  let validToken: string;
  const userId = 'user-123';
  const userEmail = 'test@example.com';

  beforeEach(() => {
    vi.resetAllMocks();
    // Generate a valid JWT for testing
    validToken = jwtService.generateAccessToken(userId, userEmail);
  });

  describe('POST /v1/photos/upload-url', () => {
    it('should return 401 without access token', async () => {
      const response = await request(app).post('/v1/photos/upload-url').send({});

      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error.code).toBe('AUTHENTICATION_ERROR');
    });

    it('should return upload URL with default options', async () => {
      const mockKey = `photos/${userId}/1234567890-abc123.jpg`;
      const mockUploadUrl = 'https://signed-url.example.com/upload';
      const mockPublicUrl = 'https://public.example.com/test.jpg';

      mockR2Service.generatePhotoKey.mockReturnValue(mockKey);
      mockR2Service.generateUploadUrl.mockResolvedValue({
        uploadUrl: mockUploadUrl,
        key: mockKey,
        publicUrl: mockPublicUrl,
        expiresIn: 300,
      });

      const response = await request(app)
        .post('/v1/photos/upload-url')
        .set('Authorization', `Bearer ${validToken}`)
        .send({});

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.uploadUrl).toBe(mockUploadUrl);
      expect(response.body.data.key).toBe(mockKey);
      expect(response.body.data.publicUrl).toBe(mockPublicUrl);
      expect(response.body.data.expiresIn).toBe(300);
    });

    it('should accept custom extension and content type', async () => {
      const mockKey = `photos/${userId}/1234567890-abc123.png`;

      mockR2Service.generatePhotoKey.mockReturnValue(mockKey);
      mockR2Service.generateUploadUrl.mockResolvedValue({
        uploadUrl: 'https://signed-url.example.com/upload',
        key: mockKey,
        publicUrl: 'https://public.example.com/test.png',
        expiresIn: 300,
      });

      const response = await request(app)
        .post('/v1/photos/upload-url')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ extension: 'png', contentType: 'image/png' });

      expect(response.status).toBe(200);
      expect(mockR2Service.generatePhotoKey).toHaveBeenCalledWith(userId, 'png');
      expect(mockR2Service.generateUploadUrl).toHaveBeenCalledWith(mockKey, 'image/png');
    });

    it('should reject invalid extension', async () => {
      const response = await request(app)
        .post('/v1/photos/upload-url')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ extension: 'exe' });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });

    it('should reject invalid content type', async () => {
      const response = await request(app)
        .post('/v1/photos/upload-url')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ contentType: 'application/pdf' });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
    });
  });

  describe('DELETE /v1/photos/:key', () => {
    it('should return 401 without access token', async () => {
      const key = encodeURIComponent(`photos/${userId}/test.jpg`);
      const response = await request(app).delete(`/v1/photos/${key}`);

      expect(response.status).toBe(401);
    });

    it('should delete photo owned by user', async () => {
      const key = `photos/${userId}/1234567890-abc123.jpg`;
      mockR2Service.deleteObject.mockResolvedValue(undefined);

      const response = await request(app)
        .delete(`/v1/photos/${encodeURIComponent(key)}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(mockR2Service.deleteObject).toHaveBeenCalledWith(key);
    });

    it('should reject deleting photo not owned by user', async () => {
      const otherUserId = 'other-user';
      const key = `photos/${otherUserId}/1234567890-abc123.jpg`;

      const response = await request(app)
        .delete(`/v1/photos/${encodeURIComponent(key)}`)
        .set('Authorization', `Bearer ${validToken}`);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(mockR2Service.deleteObject).not.toHaveBeenCalled();
    });
  });
});
