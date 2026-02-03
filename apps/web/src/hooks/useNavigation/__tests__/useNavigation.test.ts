// apps/web/src/hooks/useNavigation/__tests__/useNavigation.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useNavigation } from '../useNavigation';
import { navigationService } from '@/services/navigation/navigation.service';
import type { Spot } from '@/stores/spot.types';

// Mock the navigation service
vi.mock('@/services/navigation/navigation.service', () => ({
  navigationService: {
    navigateTo: vi.fn(),
    getNavigationUrl: vi.fn(),
    getPreferredProvider: vi.fn(() => 'google'),
  },
}));

/**
 * Create a mock spot for testing
 */
const createMockSpot = (overrides: Partial<Spot> = {}): Spot => ({
  id: 'spot-1',
  carTagId: null,
  lat: 40.7128,
  lng: -74.006,
  accuracyMeters: 10,
  address: '123 Main St, New York',
  photoUrl: null,
  note: null,
  floor: null,
  spotIdentifier: null,
  isActive: true,
  savedAt: new Date().toISOString(),
  ...overrides,
});

describe('useNavigation', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('canNavigate', () => {
    it('should return true when spot has coordinates', () => {
      const { result } = renderHook(() => useNavigation());
      const spot = createMockSpot({ address: null });
      expect(result.current.canNavigate(spot)).toBe(true);
    });

    it('should return true when spot has address only', () => {
      const { result } = renderHook(() => useNavigation());
      const spot = createMockSpot({ lat: null, lng: null });
      expect(result.current.canNavigate(spot)).toBe(true);
    });

    it('should return true when spot has both coordinates and address', () => {
      const { result } = renderHook(() => useNavigation());
      const spot = createMockSpot();
      expect(result.current.canNavigate(spot)).toBe(true);
    });

    it('should return false when spot has no coordinates and no address', () => {
      const { result } = renderHook(() => useNavigation());
      const spot = createMockSpot({ lat: null, lng: null, address: null });
      expect(result.current.canNavigate(spot)).toBe(false);
    });

    it('should return false when address is empty string', () => {
      const { result } = renderHook(() => useNavigation());
      const spot = createMockSpot({ lat: null, lng: null, address: '' });
      expect(result.current.canNavigate(spot)).toBe(false);
    });

    it('should return false when address is whitespace only', () => {
      const { result } = renderHook(() => useNavigation());
      const spot = createMockSpot({ lat: null, lng: null, address: '   ' });
      expect(result.current.canNavigate(spot)).toBe(false);
    });
  });

  describe('navigateToSpot', () => {
    it('should call navigationService.navigateTo with spot coordinates', () => {
      const { result } = renderHook(() => useNavigation());
      const spot = createMockSpot();
      result.current.navigateToSpot(spot);
      expect(navigationService.navigateTo).toHaveBeenCalledWith({
        lat: spot.lat,
        lng: spot.lng,
        address: spot.address,
      });
    });

    it('should call navigationService.navigateTo with address when no coordinates', () => {
      const { result } = renderHook(() => useNavigation());
      const spot = createMockSpot({ lat: null, lng: null });
      result.current.navigateToSpot(spot);
      expect(navigationService.navigateTo).toHaveBeenCalledWith({
        lat: null,
        lng: null,
        address: spot.address,
      });
    });

    it('should not call navigationService.navigateTo when canNavigate is false', () => {
      const { result } = renderHook(() => useNavigation());
      const spot = createMockSpot({ lat: null, lng: null, address: null });
      result.current.navigateToSpot(spot);
      expect(navigationService.navigateTo).not.toHaveBeenCalled();
    });
  });

  describe('preferredProvider', () => {
    it('should return the preferred provider from navigation service', () => {
      vi.mocked(navigationService.getPreferredProvider).mockReturnValue('apple');
      const { result } = renderHook(() => useNavigation());
      expect(result.current.preferredProvider).toBe('apple');
    });
  });
});
