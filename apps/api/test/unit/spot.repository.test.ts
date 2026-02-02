// apps/api/test/unit/spot.repository.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { spotRepository } from '../../src/repositories/spot.repository.js';
import { db } from '../../src/config/db.js';

// Mock the database
vi.mock('../../src/config/db.js', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('@repo/shared/db', () => ({
  parkingSpots: {
    id: 'id',
    userId: 'userId',
    latitude: 'latitude',
    longitude: 'longitude',
    savedAt: 'savedAt',
    isActive: 'isActive',
  },
}));

describe('SpotRepository', () => {
  const mockSpotRow = {
    id: 'spot-123',
    userId: 'user-123',
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
    vi.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new spot', async () => {
      const mockValues = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockResolvedValue([mockSpotRow]);

      vi.mocked(db.insert).mockReturnValue({
        values: mockValues,
      } as any);
      mockValues.mockReturnValue({ returning: mockReturning });

      const result = await spotRepository.create({
        userId: 'user-123',
        latitude: 40.7128,
        longitude: -74.006,
        accuracyMeters: 15,
      });

      expect(result).not.toBeNull();
      expect(result.id).toBe('spot-123');
      expect(result.latitude).toBe(40.7128);
      expect(result.longitude).toBe(-74.006);
      expect(result.accuracyMeters).toBe(15);
    });
  });

  describe('findById', () => {
    it('should return spot when found', async () => {
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([mockSpotRow]);

      vi.mocked(db.select).mockReturnValue({
        from: mockFrom,
      } as any);
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });

      const result = await spotRepository.findById('spot-123');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('spot-123');
      expect(result?.userId).toBe('user-123');
    });

    it('should return null when spot not found', async () => {
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([]);

      vi.mocked(db.select).mockReturnValue({
        from: mockFrom,
      } as any);
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });

      const result = await spotRepository.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('findByUserId', () => {
    it('should return spots for user ordered by savedAt desc', async () => {
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockOrderBy = vi.fn().mockReturnThis();
      const mockLimit = vi
        .fn()
        .mockResolvedValue([mockSpotRow, { ...mockSpotRow, id: 'spot-456' }]);

      vi.mocked(db.select).mockReturnValue({
        from: mockFrom,
      } as any);
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ orderBy: mockOrderBy });
      mockOrderBy.mockReturnValue({ limit: mockLimit });

      const result = await spotRepository.findByUserId('user-123');

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('spot-123');
    });

    it('should return empty array when no spots found', async () => {
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockOrderBy = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([]);

      vi.mocked(db.select).mockReturnValue({
        from: mockFrom,
      } as any);
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ orderBy: mockOrderBy });
      mockOrderBy.mockReturnValue({ limit: mockLimit });

      const result = await spotRepository.findByUserId('user-123');

      expect(result).toEqual([]);
    });
  });

  describe('findActiveByUserId', () => {
    it('should return active spot when found', async () => {
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockOrderBy = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([mockSpotRow]);

      vi.mocked(db.select).mockReturnValue({
        from: mockFrom,
      } as any);
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ orderBy: mockOrderBy });
      mockOrderBy.mockReturnValue({ limit: mockLimit });

      const result = await spotRepository.findActiveByUserId('user-123');

      expect(result).not.toBeNull();
      expect(result?.isActive).toBe(true);
    });

    it('should return null when spot is not active', async () => {
      const inactiveSpot = { ...mockSpotRow, isActive: false };
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockOrderBy = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([inactiveSpot]);

      vi.mocked(db.select).mockReturnValue({
        from: mockFrom,
      } as any);
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ orderBy: mockOrderBy });
      mockOrderBy.mockReturnValue({ limit: mockLimit });

      const result = await spotRepository.findActiveByUserId('user-123');

      expect(result).toBeNull();
    });
  });

  describe('update', () => {
    it('should update and return spot', async () => {
      const updatedSpot = { ...mockSpotRow, note: 'Updated note' };
      const mockSet = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockResolvedValue([updatedSpot]);

      vi.mocked(db.update).mockReturnValue({
        set: mockSet,
      } as any);
      mockSet.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ returning: mockReturning });

      const result = await spotRepository.update('spot-123', { note: 'Updated note' });

      expect(result).not.toBeNull();
      expect(result?.note).toBe('Updated note');
    });

    it('should return null when spot not found', async () => {
      const mockSet = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockResolvedValue([]);

      vi.mocked(db.update).mockReturnValue({
        set: mockSet,
      } as any);
      mockSet.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ returning: mockReturning });

      const result = await spotRepository.update('nonexistent', { note: 'Updated note' });

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should return true when spot deleted', async () => {
      const mockWhere = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockResolvedValue([mockSpotRow]);

      vi.mocked(db.delete).mockReturnValue({
        where: mockWhere,
      } as any);
      mockWhere.mockReturnValue({ returning: mockReturning });

      const result = await spotRepository.delete('spot-123');

      expect(result).toBe(true);
    });

    it('should return false when spot not found', async () => {
      const mockWhere = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockResolvedValue([]);

      vi.mocked(db.delete).mockReturnValue({
        where: mockWhere,
      } as any);
      mockWhere.mockReturnValue({ returning: mockReturning });

      const result = await spotRepository.delete('nonexistent');

      expect(result).toBe(false);
    });
  });

  describe('date conversion (toDate helper)', () => {
    it('should handle Date objects from database', async () => {
      const mockValues = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockResolvedValue([mockSpotRow]);

      vi.mocked(db.insert).mockReturnValue({
        values: mockValues,
      } as any);
      mockValues.mockReturnValue({ returning: mockReturning });

      const result = await spotRepository.create({
        userId: 'user-123',
        latitude: 40.7128,
        longitude: -74.006,
      });

      expect(result.savedAt).toBeInstanceOf(Date);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should convert string dates to Date objects (Neon driver format)', async () => {
      const stringDateRow = {
        ...mockSpotRow,
        savedAt: '2026-01-15T12:00:00.000Z',
        createdAt: '2026-01-15T12:00:00.000Z',
        updatedAt: '2026-01-15T12:00:00.000Z',
      };

      const mockValues = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockResolvedValue([stringDateRow]);

      vi.mocked(db.insert).mockReturnValue({
        values: mockValues,
      } as any);
      mockValues.mockReturnValue({ returning: mockReturning });

      const result = await spotRepository.create({
        userId: 'user-123',
        latitude: 40.7128,
        longitude: -74.006,
      });

      expect(result.savedAt).toBeInstanceOf(Date);
      expect(result.savedAt.toISOString()).toBe('2026-01-15T12:00:00.000Z');
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should fallback to current time for null dates', async () => {
      const now = Date.now();
      const nullDateRow = {
        ...mockSpotRow,
        savedAt: null,
        createdAt: null,
        updatedAt: null,
      };

      const mockValues = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockResolvedValue([nullDateRow]);

      vi.mocked(db.insert).mockReturnValue({
        values: mockValues,
      } as any);
      mockValues.mockReturnValue({ returning: mockReturning });

      const result = await spotRepository.create({
        userId: 'user-123',
        latitude: 40.7128,
        longitude: -74.006,
      });

      expect(result.savedAt).toBeInstanceOf(Date);
      expect(result.savedAt.getTime()).toBeGreaterThanOrEqual(now);
      expect(result.createdAt).toBeInstanceOf(Date);
      expect(result.updatedAt).toBeInstanceOf(Date);
    });

    it('should fallback to current time for undefined dates', async () => {
      const now = Date.now();
      const undefinedDateRow = {
        ...mockSpotRow,
        savedAt: undefined,
        createdAt: undefined,
        updatedAt: undefined,
      };

      const mockValues = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockResolvedValue([undefinedDateRow]);

      vi.mocked(db.insert).mockReturnValue({
        values: mockValues,
      } as any);
      mockValues.mockReturnValue({ returning: mockReturning });

      const result = await spotRepository.create({
        userId: 'user-123',
        latitude: 40.7128,
        longitude: -74.006,
      });

      expect(result.savedAt).toBeInstanceOf(Date);
      expect(result.savedAt.getTime()).toBeGreaterThanOrEqual(now);
    });
  });
});
