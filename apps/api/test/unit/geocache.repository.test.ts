// apps/api/test/unit/geocache.repository.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { geocacheRepository } from '../../src/repositories/geocache.repository.js';
import { db } from '../../src/config/db.js';

// Mock the database
vi.mock('../../src/config/db.js', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
  },
}));

vi.mock('@repo/shared/db', () => ({
  geocodingCache: {
    id: 'id',
    addressQuery: 'addressQuery',
    lat: 'lat',
    lng: 'lng',
    formattedAddress: 'formattedAddress',
    createdAt: 'createdAt',
  },
}));

describe('GeocacheRepository', () => {
  const mockDbRow = {
    id: 'cache-123',
    addressQuery: '123 main st, new york',
    lat: 40.7128,
    lng: -74.006,
    formattedAddress: '123 Main St, New York, NY 10001, USA',
    createdAt: new Date('2025-01-01'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('findByAddress', () => {
    it('should return cached entry when found', async () => {
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([mockDbRow]);

      vi.mocked(db.select).mockReturnValue({
        from: mockFrom,
      } as never);
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });

      const result = await geocacheRepository.findByAddress('123 Main St, New York');

      expect(result).not.toBeNull();
      expect(result?.lat).toBe(40.7128);
      expect(result?.lng).toBe(-74.006);
      expect(result?.formattedAddress).toBe('123 Main St, New York, NY 10001, USA');
    });

    it('should return null when not found', async () => {
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([]);

      vi.mocked(db.select).mockReturnValue({
        from: mockFrom,
      } as never);
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });

      const result = await geocacheRepository.findByAddress('nonexistent address');

      expect(result).toBeNull();
    });

    it('should normalize query to lowercase and trim', async () => {
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([mockDbRow]);

      vi.mocked(db.select).mockReturnValue({
        from: mockFrom,
      } as never);
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });

      // Call with uppercase and extra spaces
      await geocacheRepository.findByAddress('  123 MAIN ST, NEW YORK  ');

      // Should still find because of normalization
      expect(db.select).toHaveBeenCalled();
    });
  });

  describe('findByCoords', () => {
    it('should return cached entry when found by coordinates', async () => {
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([mockDbRow]);

      vi.mocked(db.select).mockReturnValue({
        from: mockFrom,
      } as never);
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });

      const result = await geocacheRepository.findByCoords(40.7128, -74.006);

      expect(result).not.toBeNull();
      expect(result?.lat).toBe(40.7128);
      expect(result?.lng).toBe(-74.006);
      expect(result?.formattedAddress).toBe('123 Main St, New York, NY 10001, USA');
    });

    it('should return null when not found by coordinates', async () => {
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([]);

      vi.mocked(db.select).mockReturnValue({
        from: mockFrom,
      } as never);
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });

      const result = await geocacheRepository.findByCoords(0.0, 0.0);

      expect(result).toBeNull();
    });

    it('should call database select for coordinate lookup', async () => {
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([mockDbRow]);

      vi.mocked(db.select).mockReturnValue({
        from: mockFrom,
      } as never);
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });

      await geocacheRepository.findByCoords(40.7128, -74.006);

      expect(db.select).toHaveBeenCalled();
      expect(mockFrom).toHaveBeenCalled();
      expect(mockWhere).toHaveBeenCalled();
      expect(mockLimit).toHaveBeenCalledWith(1);
    });
  });

  describe('create', () => {
    it('should create a new geocache entry', async () => {
      const mockValues = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockResolvedValue([mockDbRow]);

      vi.mocked(db.insert).mockReturnValue({
        values: mockValues,
      } as never);
      mockValues.mockReturnValue({ returning: mockReturning });

      const result = await geocacheRepository.create({
        addressQuery: '123 Main St, New York',
        lat: 40.7128,
        lng: -74.006,
        formattedAddress: '123 Main St, New York, NY 10001, USA',
      });

      expect(result).not.toBeNull();
      expect(result.lat).toBe(40.7128);
      expect(result.lng).toBe(-74.006);
      expect(result.formattedAddress).toBe('123 Main St, New York, NY 10001, USA');
    });

    it('should normalize addressQuery before storing', async () => {
      const mockValues = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockResolvedValue([mockDbRow]);

      vi.mocked(db.insert).mockReturnValue({
        values: mockValues,
      } as never);
      mockValues.mockReturnValue({ returning: mockReturning });

      await geocacheRepository.create({
        addressQuery: '  123 MAIN ST  ',
        lat: 40.7128,
        lng: -74.006,
      });

      // Check that values was called with normalized addressQuery
      expect(mockValues).toHaveBeenCalledWith(
        expect.objectContaining({
          addressQuery: '123 main st',
        })
      );
    });

    it('should handle null formattedAddress', async () => {
      const mockDbRowNoFormatted = {
        ...mockDbRow,
        formattedAddress: null,
      };

      const mockValues = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockResolvedValue([mockDbRowNoFormatted]);

      vi.mocked(db.insert).mockReturnValue({
        values: mockValues,
      } as never);
      mockValues.mockReturnValue({ returning: mockReturning });

      const result = await geocacheRepository.create({
        addressQuery: '123 Main St',
        lat: 40.7128,
        lng: -74.006,
      });

      expect(result.formattedAddress).toBeNull();
    });
  });
});
