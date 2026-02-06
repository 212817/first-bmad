// apps/web/src/utils/__tests__/filterSpots.test.ts
import { describe, it, expect } from 'vitest';
import { filterSpots } from '../filterSpots';
import type { Spot } from '@/stores/spot.types';

const createMockSpot = (overrides: Partial<Spot> = {}): Spot => ({
  id: `spot-${Math.random().toString(36).slice(2)}`,
  carTagId: null,
  lat: 40.7128,
  lng: -74.006,
  accuracyMeters: 15,
  address: '123 Main St',
  photoUrl: null,
  note: null,
  floor: null,
  spotIdentifier: null,
  meterExpiresAt: null,
  isActive: false,
  savedAt: new Date().toISOString(),
  ...overrides,
});

describe('filterSpots', () => {
  describe('no filters', () => {
    it('should return all spots when no filters applied', () => {
      const spots = [createMockSpot(), createMockSpot(), createMockSpot()];
      const result = filterSpots(spots, {});
      expect(result).toHaveLength(3);
    });

    it('should return empty array when spots is empty', () => {
      const result = filterSpots([], {});
      expect(result).toHaveLength(0);
    });
  });

  describe('text query filter', () => {
    it('should filter by address (case-insensitive)', () => {
      const spots = [
        createMockSpot({ address: 'Downtown Parking' }),
        createMockSpot({ address: 'Airport Garage' }),
        createMockSpot({ address: 'Mall parking lot' }),
      ];

      const result = filterSpots(spots, { query: 'parking' });
      expect(result).toHaveLength(2);
      expect(result[0]?.address).toBe('Downtown Parking');
      expect(result[1]?.address).toBe('Mall parking lot');
    });

    it('should filter by note (case-insensitive)', () => {
      const spots = [
        createMockSpot({ note: 'Near the elevator' }),
        createMockSpot({ note: 'By the exit' }),
        createMockSpot({ note: 'Level 2 elevator area' }),
      ];

      const result = filterSpots(spots, { query: 'ELEVATOR' });
      expect(result).toHaveLength(2);
    });

    it('should return empty when no match found', () => {
      const spots = [
        createMockSpot({ address: 'Downtown', note: 'Level 1' }),
        createMockSpot({ address: 'Airport', note: 'Near door' }),
      ];

      const result = filterSpots(spots, { query: 'xyz123' });
      expect(result).toHaveLength(0);
    });

    it('should handle empty query string', () => {
      const spots = [createMockSpot(), createMockSpot()];
      const result = filterSpots(spots, { query: '' });
      expect(result).toHaveLength(2);
    });

    it('should handle whitespace-only query', () => {
      const spots = [createMockSpot(), createMockSpot()];
      const result = filterSpots(spots, { query: '   ' });
      expect(result).toHaveLength(2);
    });

    it('should search by car tag name when lookup provided', () => {
      const spots = [
        createMockSpot({ carTagId: 'tag-1' }),
        createMockSpot({ carTagId: 'tag-2' }),
        createMockSpot({ carTagId: null }),
      ];

      const tagLookup = (id: string) => (id === 'tag-1' ? 'Work Car' : 'Personal');
      const result = filterSpots(spots, { query: 'work' }, tagLookup);

      expect(result).toHaveLength(1);
      expect(result[0]?.carTagId).toBe('tag-1');
    });
  });

  describe('car tag filter', () => {
    it('should filter by car tag ID', () => {
      const spots = [
        createMockSpot({ carTagId: 'tag-1' }),
        createMockSpot({ carTagId: 'tag-2' }),
        createMockSpot({ carTagId: 'tag-1' }),
      ];

      const result = filterSpots(spots, { carTagId: 'tag-1' });

      expect(result).toHaveLength(2);
    });

    it('should exclude spots with different car tag', () => {
      const spots = [createMockSpot({ carTagId: 'tag-1' }), createMockSpot({ carTagId: 'tag-2' })];

      const result = filterSpots(spots, { carTagId: 'tag-1' });

      expect(result).toHaveLength(1);
      expect(result[0]?.carTagId).toBe('tag-1');
    });

    it('should exclude spots without car tag when filtering by ID', () => {
      const spots = [createMockSpot({ carTagId: 'tag-1' }), createMockSpot({ carTagId: null })];

      const result = filterSpots(spots, { carTagId: 'tag-1' });

      expect(result).toHaveLength(1);
    });
  });

  describe('date range filter', () => {
    it('should filter by start date', () => {
      const spots = [
        createMockSpot({ savedAt: '2026-01-15T10:00:00Z' }),
        createMockSpot({ savedAt: '2026-01-10T10:00:00Z' }),
        createMockSpot({ savedAt: '2026-01-20T10:00:00Z' }),
      ];

      const result = filterSpots(spots, { startDate: new Date('2026-01-12T00:00:00Z') });
      expect(result).toHaveLength(2);
    });

    it('should filter by end date', () => {
      const spots = [
        createMockSpot({ savedAt: '2026-01-15T10:00:00Z' }),
        createMockSpot({ savedAt: '2026-01-10T10:00:00Z' }),
        createMockSpot({ savedAt: '2026-01-20T10:00:00Z' }),
      ];

      const result = filterSpots(spots, { endDate: new Date('2026-01-16T00:00:00Z') });
      expect(result).toHaveLength(2);
    });

    it('should filter by date range', () => {
      const spots = [
        createMockSpot({ savedAt: '2026-01-15T10:00:00Z' }),
        createMockSpot({ savedAt: '2026-01-10T10:00:00Z' }),
        createMockSpot({ savedAt: '2026-01-20T10:00:00Z' }),
      ];

      const result = filterSpots(spots, {
        startDate: new Date('2026-01-12T00:00:00Z'),
        endDate: new Date('2026-01-18T00:00:00Z'),
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('combined filters', () => {
    it('should apply multiple filters together', () => {
      const spots = [
        createMockSpot({ address: 'Downtown Parking', carTagId: 'tag-1' }),
        createMockSpot({ address: 'Airport Parking', carTagId: 'tag-2' }),
        createMockSpot({ address: 'Downtown Mall', carTagId: 'tag-1' }),
      ];

      const result = filterSpots(spots, { query: 'downtown', carTagId: 'tag-1' });

      expect(result).toHaveLength(2);
    });

    it('should return empty when combined filters match nothing', () => {
      const spots = [
        createMockSpot({ address: 'Downtown', carTagId: 'tag-1' }),
        createMockSpot({ address: 'Airport', carTagId: 'tag-2' }),
      ];

      const result = filterSpots(spots, { query: 'downtown', carTagId: 'tag-2' });

      expect(result).toHaveLength(0);
    });
  });
});
