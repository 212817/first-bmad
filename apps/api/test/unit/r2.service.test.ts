// apps/api/test/unit/r2.service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { r2Service } from '../../src/services/r2/r2.service.js';

// Store command instances for assertions
const putObjectCommands: Array<{ Bucket: string; Key: string; ContentType: string }> = [];
const getObjectCommands: Array<{ Bucket: string; Key: string }> = [];
const deleteObjectCommands: Array<{ Bucket: string; Key: string }> = [];

// Mock the AWS SDK with proper class implementations
const mockSend = vi.fn().mockResolvedValue({});

vi.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: class MockS3Client {
      send = mockSend;
    },
    PutObjectCommand: class MockPutObjectCommand {
      input: { Bucket: string; Key: string; ContentType: string };
      constructor(params: { Bucket: string; Key: string; ContentType: string }) {
        this.input = params;
        putObjectCommands.push(params);
      }
    },
    GetObjectCommand: class MockGetObjectCommand {
      input: { Bucket: string; Key: string };
      constructor(params: { Bucket: string; Key: string }) {
        this.input = params;
        getObjectCommands.push(params);
      }
    },
    DeleteObjectCommand: class MockDeleteObjectCommand {
      input: { Bucket: string; Key: string };
      constructor(params: { Bucket: string; Key: string }) {
        this.input = params;
        deleteObjectCommands.push(params);
      }
    },
  };
});

vi.mock('@aws-sdk/s3-request-presigner', () => ({
  getSignedUrl: vi.fn().mockResolvedValue('https://signed-url.example.com/test'),
}));

describe('r2Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    putObjectCommands.length = 0;
    getObjectCommands.length = 0;
    deleteObjectCommands.length = 0;
  });

  describe('generatePhotoKey', () => {
    it('should generate a unique key with userId', () => {
      const userId = 'user-123';
      const key = r2Service.generatePhotoKey(userId);

      expect(key).toMatch(/^photos\/user-123\/\d+-[a-z0-9]+\.jpg$/);
    });

    it('should include custom extension', () => {
      const userId = 'user-123';
      const key = r2Service.generatePhotoKey(userId, 'png');

      expect(key).toMatch(/^photos\/user-123\/\d+-[a-z0-9]+\.png$/);
    });

    it('should generate unique keys on each call', () => {
      const userId = 'user-123';
      const key1 = r2Service.generatePhotoKey(userId);
      const key2 = r2Service.generatePhotoKey(userId);

      expect(key1).not.toBe(key2);
    });
  });

  describe('generateUploadUrl', () => {
    it('should return upload URL with key and public URL', async () => {
      const key = 'photos/user-123/test.jpg';

      const result = await r2Service.generateUploadUrl(key);

      expect(result.uploadUrl).toBe('https://signed-url.example.com/test');
      expect(result.key).toBe(key);
      expect(result.expiresIn).toBe(300);
      expect(result.publicUrl).toBeDefined();
    });

    it('should use default content type of image/jpeg', async () => {
      const key = 'photos/user-123/test.jpg';

      await r2Service.generateUploadUrl(key);

      expect(putObjectCommands).toHaveLength(1);
      expect(putObjectCommands[0]).toEqual(
        expect.objectContaining({
          Key: key,
          ContentType: 'image/jpeg',
        })
      );
    });

    it('should use custom content type when provided', async () => {
      const key = 'photos/user-123/test.png';

      await r2Service.generateUploadUrl(key, 'image/png');

      expect(putObjectCommands).toHaveLength(1);
      expect(putObjectCommands[0]).toEqual(
        expect.objectContaining({
          Key: key,
          ContentType: 'image/png',
        })
      );
    });
  });

  describe('generateDownloadUrl', () => {
    it('should return download URL with expiry', async () => {
      const key = 'photos/user-123/test.jpg';

      const result = await r2Service.generateDownloadUrl(key);

      expect(result.downloadUrl).toBe('https://signed-url.example.com/test');
      // 1-hour expiry for better UX - photos can be viewed longer without re-fetching
      expect(result.expiresIn).toBe(3600);
    });
  });

  describe('deleteObject', () => {
    it('should send delete command', async () => {
      const key = 'photos/user-123/test.jpg';

      await r2Service.deleteObject(key);

      expect(deleteObjectCommands).toHaveLength(1);
      expect(deleteObjectCommands[0]).toEqual(
        expect.objectContaining({
          Key: key,
        })
      );
    });
  });
});
