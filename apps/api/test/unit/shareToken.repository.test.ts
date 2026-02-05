// apps/api/test/unit/shareToken.repository.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { shareTokenRepository } from '../../src/repositories/shareToken.repository.js';
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
  shareTokens: {
    id: 'id',
    token: 'token',
    spotId: 'spotId',
    createdAt: 'createdAt',
    expiresAt: 'expiresAt',
  },
  parkingSpots: {
    id: 'id',
    userId: 'userId',
    latitude: 'latitude',
    longitude: 'longitude',
    savedAt: 'savedAt',
    isActive: 'isActive',
  },
}));

describe('ShareTokenRepository', () => {
  const mockTokenRow = {
    id: 'token-123',
    token: 'abc123xyz',
    spotId: 'spot-123',
    createdAt: new Date('2026-02-04T12:00:00Z'),
    expiresAt: new Date('2026-02-11T12:00:00Z'),
  };

  const mockSpotRow = {
    id: 'spot-123',
    userId: 'user-123',
    carTagId: null,
    latitude: 40.7128,
    longitude: -74.006,
    accuracyMeters: 15,
    address: '123 Main St',
    photoUrl: null,
    note: null,
    floor: null,
    spotIdentifier: null,
    isActive: true,
    savedAt: new Date('2026-02-01T12:00:00Z'),
    createdAt: new Date('2026-02-01T12:00:00Z'),
    updatedAt: new Date('2026-02-01T12:00:00Z'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new share token', async () => {
      const mockValues = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockResolvedValue([mockTokenRow]);

      vi.mocked(db.insert).mockReturnValue({
        values: mockValues,
      } as unknown as ReturnType<typeof db.insert>);
      mockValues.mockReturnValue({ returning: mockReturning });

      const expiresAt = new Date('2026-02-11T12:00:00Z');
      const result = await shareTokenRepository.create({
        spotId: 'spot-123',
        token: 'abc123xyz',
        expiresAt,
      });

      expect(result).not.toBeNull();
      expect(result.id).toBe('token-123');
      expect(result.token).toBe('abc123xyz');
      expect(result.spotId).toBe('spot-123');
    });
  });

  describe('findByToken', () => {
    it('should return token with spot when found and not expired', async () => {
      const mockFrom = vi.fn().mockReturnThis();
      const mockInnerJoin = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([
        {
          shareToken: mockTokenRow,
          spot: mockSpotRow,
        },
      ]);

      vi.mocked(db.select).mockReturnValue({
        from: mockFrom,
      } as unknown as ReturnType<typeof db.select>);
      mockFrom.mockReturnValue({ innerJoin: mockInnerJoin });
      mockInnerJoin.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });

      const result = await shareTokenRepository.findByToken('abc123xyz');

      expect(result).not.toBeNull();
      expect(result?.token).toBe('abc123xyz');
      expect(result?.spot.id).toBe('spot-123');
      expect(result?.spot.address).toBe('123 Main St');
    });

    it('should return null when token not found', async () => {
      const mockFrom = vi.fn().mockReturnThis();
      const mockInnerJoin = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([]);

      vi.mocked(db.select).mockReturnValue({
        from: mockFrom,
      } as unknown as ReturnType<typeof db.select>);
      mockFrom.mockReturnValue({ innerJoin: mockInnerJoin });
      mockInnerJoin.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });

      const result = await shareTokenRepository.findByToken('nonexistent');

      expect(result).toBeNull();
    });

    it('should return null when token is expired', async () => {
      const expiredTokenRow = {
        ...mockTokenRow,
        expiresAt: new Date('2020-01-01T00:00:00Z'), // Expired
      };

      const mockFrom = vi.fn().mockReturnThis();
      const mockInnerJoin = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([
        {
          shareToken: expiredTokenRow,
          spot: mockSpotRow,
        },
      ]);

      vi.mocked(db.select).mockReturnValue({
        from: mockFrom,
      } as unknown as ReturnType<typeof db.select>);
      mockFrom.mockReturnValue({ innerJoin: mockInnerJoin });
      mockInnerJoin.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });

      const result = await shareTokenRepository.findByToken('abc123xyz');

      expect(result).toBeNull();
    });
  });

  describe('deleteExpired', () => {
    it('should delete expired tokens and return count', async () => {
      const mockWhere = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockResolvedValue([{ id: 'token-1' }, { id: 'token-2' }]);

      vi.mocked(db.delete).mockReturnValue({
        where: mockWhere,
      } as unknown as ReturnType<typeof db.delete>);
      mockWhere.mockReturnValue({ returning: mockReturning });

      const result = await shareTokenRepository.deleteExpired();

      expect(result).toBe(2);
    });

    it('should return 0 when no expired tokens', async () => {
      const mockWhere = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockResolvedValue([]);

      vi.mocked(db.delete).mockReturnValue({
        where: mockWhere,
      } as unknown as ReturnType<typeof db.delete>);
      mockWhere.mockReturnValue({ returning: mockReturning });

      const result = await shareTokenRepository.deleteExpired();

      expect(result).toBe(0);
    });
  });

  describe('deleteBySpotId', () => {
    it('should delete all tokens for a spot', async () => {
      const mockWhere = vi.fn().mockResolvedValue(undefined);

      vi.mocked(db.delete).mockReturnValue({
        where: mockWhere,
      } as unknown as ReturnType<typeof db.delete>);

      await expect(shareTokenRepository.deleteBySpotId('spot-123')).resolves.toBeUndefined();

      expect(db.delete).toHaveBeenCalled();
    });
  });
});
