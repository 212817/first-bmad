// apps/api/test/unit/refreshToken.repository.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { refreshTokenRepository } from '../../src/repositories/refreshToken.repository.js';
import { db } from '../../src/config/db.js';

// Mock the database
vi.mock('../../src/config/db.js', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('@repo/shared/db', () => ({
  refreshTokens: {
    id: 'id',
    userId: 'userId',
    tokenHash: 'tokenHash',
    expiresAt: 'expiresAt',
  },
}));

describe('RefreshTokenRepository', () => {
  const mockDbRow = {
    id: 'token-123',
    userId: 'user-123',
    tokenHash: 'hash-abc',
    expiresAt: new Date('2025-01-10'),
    createdAt: new Date('2025-01-01'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create and return new refresh token', async () => {
      const mockValues = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockResolvedValue([mockDbRow]);

      vi.mocked(db.insert).mockReturnValue({
        values: mockValues,
      } as any);
      mockValues.mockReturnValue({ returning: mockReturning });

      const result = await refreshTokenRepository.create({
        userId: 'user-123',
        tokenHash: 'hash-abc',
        expiresAt: new Date('2025-01-10'),
      });

      expect(result.id).toBe('token-123');
      expect(result.userId).toBe('user-123');
      expect(result.tokenHash).toBe('hash-abc');
    });
  });

  describe('findByTokenHash', () => {
    it('should return token when found', async () => {
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([mockDbRow]);

      vi.mocked(db.select).mockReturnValue({
        from: mockFrom,
      } as any);
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });

      const result = await refreshTokenRepository.findByTokenHash('hash-abc');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('token-123');
      expect(result?.tokenHash).toBe('hash-abc');
    });

    it('should return null when token not found', async () => {
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([]);

      vi.mocked(db.select).mockReturnValue({
        from: mockFrom,
      } as any);
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });

      const result = await refreshTokenRepository.findByTokenHash('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('deleteByUserId', () => {
    it('should delete tokens and return count', async () => {
      const mockWhere = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockResolvedValue([{ id: '1' }, { id: '2' }, { id: '3' }]);

      vi.mocked(db.delete).mockReturnValue({
        where: mockWhere,
      } as any);
      mockWhere.mockReturnValue({ returning: mockReturning });

      const result = await refreshTokenRepository.deleteByUserId('user-123');

      expect(result).toBe(3);
    });

    it('should return 0 when no tokens found', async () => {
      const mockWhere = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockResolvedValue([]);

      vi.mocked(db.delete).mockReturnValue({
        where: mockWhere,
      } as any);
      mockWhere.mockReturnValue({ returning: mockReturning });

      const result = await refreshTokenRepository.deleteByUserId('user-with-no-tokens');

      expect(result).toBe(0);
    });
  });

  describe('deleteByTokenHash', () => {
    it('should delete token and return true', async () => {
      const mockWhere = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockResolvedValue([{ id: '1' }]);

      vi.mocked(db.delete).mockReturnValue({
        where: mockWhere,
      } as any);
      mockWhere.mockReturnValue({ returning: mockReturning });

      const result = await refreshTokenRepository.deleteByTokenHash('hash-abc');

      expect(result).toBe(true);
    });

    it('should return false when token not found', async () => {
      const mockWhere = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockResolvedValue([]);

      vi.mocked(db.delete).mockReturnValue({
        where: mockWhere,
      } as any);
      mockWhere.mockReturnValue({ returning: mockReturning });

      const result = await refreshTokenRepository.deleteByTokenHash('nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('deleteExpired', () => {
    it('should delete expired tokens and return count', async () => {
      const mockWhere = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockResolvedValue([{ id: '1' }, { id: '2' }]);

      vi.mocked(db.delete).mockReturnValue({
        where: mockWhere,
      } as any);
      mockWhere.mockReturnValue({ returning: mockReturning });

      const result = await refreshTokenRepository.deleteExpired();

      expect(result).toBe(2);
    });

    it('should return 0 when no expired tokens', async () => {
      const mockWhere = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockResolvedValue([]);

      vi.mocked(db.delete).mockReturnValue({
        where: mockWhere,
      } as any);
      mockWhere.mockReturnValue({ returning: mockReturning });

      const result = await refreshTokenRepository.deleteExpired();

      expect(result).toBe(0);
    });
  });
});
