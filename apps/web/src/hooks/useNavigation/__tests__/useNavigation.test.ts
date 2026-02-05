// apps/web/src/hooks/useNavigation/__tests__/useNavigation.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useNavigation } from '../useNavigation';
import { navigationService } from '@/services/navigation/navigation.service';
import type { Spot } from '@/stores/spot.types';

// Mock the navigation service
vi.mock('@/services/navigation/navigation.service', () => ({
  navigationService: {
    navigateTo: vi.fn(),
    getNavigationUrl: vi.fn(),
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
    it('should call navigationService.navigateTo with spot coordinates and provider', () => {
      const { result } = renderHook(() => useNavigation());
      const spot = createMockSpot();
      result.current.navigateToSpot(spot, 'google');
      expect(navigationService.navigateTo).toHaveBeenCalledWith(
        {
          lat: spot.lat,
          lng: spot.lng,
          address: spot.address,
        },
        'google'
      );
    });

    it('should call navigationService.navigateTo with address when no coordinates', () => {
      const { result } = renderHook(() => useNavigation());
      const spot = createMockSpot({ lat: null, lng: null });
      result.current.navigateToSpot(spot, 'apple');
      expect(navigationService.navigateTo).toHaveBeenCalledWith(
        {
          lat: null,
          lng: null,
          address: spot.address,
        },
        'apple'
      );
    });

    it('should not call navigationService.navigateTo when canNavigate is false', () => {
      const { result } = renderHook(() => useNavigation());
      const spot = createMockSpot({ lat: null, lng: null, address: null });
      result.current.navigateToSpot(spot, 'google');
      expect(navigationService.navigateTo).not.toHaveBeenCalled();
    });
  });

  describe('map picker state', () => {
    it('should initially have picker closed with no pending spot', () => {
      const { result } = renderHook(() => useNavigation());
      expect(result.current.isPickerOpen).toBe(false);
      expect(result.current.pendingSpot).toBeNull();
    });

    it('should open picker and set pending spot', () => {
      const { result } = renderHook(() => useNavigation());
      const spot = createMockSpot();

      act(() => {
        result.current.openPicker(spot);
      });

      expect(result.current.isPickerOpen).toBe(true);
      expect(result.current.pendingSpot).toBe(spot);
    });

    it('should close picker and clear pending spot', () => {
      const { result } = renderHook(() => useNavigation());
      const spot = createMockSpot();

      act(() => {
        result.current.openPicker(spot);
      });

      act(() => {
        result.current.closePicker();
      });

      expect(result.current.isPickerOpen).toBe(false);
      expect(result.current.pendingSpot).toBeNull();
    });
  });
});
