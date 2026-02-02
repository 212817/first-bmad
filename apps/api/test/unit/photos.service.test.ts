// apps/api/test/unit/photos.service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { photosService } from '../../src/routes/photos/photos.service.js';
import { r2Service } from '../../src/services/r2/r2.service.js';
import { AuthorizationError } from '@repo/shared/errors';

vi.mock('../../src/services/r2/r2.service.js', () => ({
  r2Service: {
    generatePhotoKey: vi.fn(),
    generateUploadUrl: vi.fn(),
    deleteObject: vi.fn(),
  },
}));

describe('photosService', () => {
  const userId = 'user-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getUploadUrl', () => {
    it('should generate upload URL with default options', async () => {
      const mockKey = `photos/${userId}/1234567890-abc123.jpg`;
      const mockUploadUrl = 'https://signed-url.example.com/upload';
      const mockPublicUrl = 'https://public.example.com/photos/user-123/test.jpg';

      vi.mocked(r2Service.generatePhotoKey).mockReturnValue(mockKey);
      vi.mocked(r2Service.generateUploadUrl).mockResolvedValue({
        uploadUrl: mockUploadUrl,
        key: mockKey,
        publicUrl: mockPublicUrl,
        expiresIn: 300,
      });

      const result = await photosService.getUploadUrl(userId);

      expect(r2Service.generatePhotoKey).toHaveBeenCalledWith(userId, 'jpg');
      expect(r2Service.generateUploadUrl).toHaveBeenCalledWith(mockKey, 'image/jpeg');
      expect(result.uploadUrl).toBe(mockUploadUrl);
      expect(result.key).toBe(mockKey);
      expect(result.publicUrl).toBe(mockPublicUrl);
    });

    it('should accept custom extension', async () => {
      const mockKey = `photos/${userId}/1234567890-abc123.png`;

      vi.mocked(r2Service.generatePhotoKey).mockReturnValue(mockKey);
      vi.mocked(r2Service.generateUploadUrl).mockResolvedValue({
        uploadUrl: 'https://signed-url.example.com/upload',
        key: mockKey,
        publicUrl: 'https://public.example.com/test.png',
        expiresIn: 300,
      });

      await photosService.getUploadUrl(userId, 'png', 'image/png');

      expect(r2Service.generatePhotoKey).toHaveBeenCalledWith(userId, 'png');
      expect(r2Service.generateUploadUrl).toHaveBeenCalledWith(mockKey, 'image/png');
    });

    it('should throw for invalid extension', async () => {
      await expect(photosService.getUploadUrl(userId, 'exe')).rejects.toThrow(AuthorizationError);
    });

    it('should throw for invalid content type', async () => {
      await expect(photosService.getUploadUrl(userId, 'jpg', 'application/pdf')).rejects.toThrow(
        AuthorizationError
      );
    });

    it('should handle uppercase extensions', async () => {
      const mockKey = `photos/${userId}/1234567890-abc123.jpeg`;

      vi.mocked(r2Service.generatePhotoKey).mockReturnValue(mockKey);
      vi.mocked(r2Service.generateUploadUrl).mockResolvedValue({
        uploadUrl: 'https://signed-url.example.com/upload',
        key: mockKey,
        publicUrl: 'https://public.example.com/test.jpeg',
        expiresIn: 300,
      });

      await photosService.getUploadUrl(userId, 'JPEG', 'image/jpeg');

      expect(r2Service.generatePhotoKey).toHaveBeenCalledWith(userId, 'jpeg');
    });
  });

  describe('deletePhoto', () => {
    it('should delete photo owned by user', async () => {
      const key = `photos/${userId}/1234567890-abc123.jpg`;

      vi.mocked(r2Service.deleteObject).mockResolvedValue(undefined);

      await photosService.deletePhoto(userId, key);

      expect(r2Service.deleteObject).toHaveBeenCalledWith(key);
    });

    it('should throw for photo not owned by user', async () => {
      const otherUserId = 'other-user';
      const key = `photos/${otherUserId}/1234567890-abc123.jpg`;

      await expect(photosService.deletePhoto(userId, key)).rejects.toThrow(AuthorizationError);
      expect(r2Service.deleteObject).not.toHaveBeenCalled();
    });

    it('should throw for invalid key format', async () => {
      const key = 'invalid-key-format.jpg';

      await expect(photosService.deletePhoto(userId, key)).rejects.toThrow(AuthorizationError);
    });
  });
});
