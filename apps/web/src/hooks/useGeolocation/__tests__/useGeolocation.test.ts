// apps/web/src/hooks/useGeolocation/__tests__/useGeolocation.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useGeolocation } from '../useGeolocation';

describe('useGeolocation', () => {
  const mockGeolocation = {
    getCurrentPosition: vi.fn(),
    watchPosition: vi.fn(),
    clearWatch: vi.fn(),
  };

  const mockPermissions = {
    query: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    // Setup navigator.geolocation mock
    Object.defineProperty(navigator, 'geolocation', {
      value: mockGeolocation,
      writable: true,
      configurable: true,
    });
    // Setup navigator.permissions mock
    Object.defineProperty(navigator, 'permissions', {
      value: mockPermissions,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should return initial state with no position', () => {
      const { result } = renderHook(() => useGeolocation());

      expect(result.current.position).toBeNull();
      expect(result.current.error).toBeNull();
      expect(result.current.isLoading).toBe(false);
      expect(result.current.permissionState).toBe('prompt');
    });

    it('should provide getCurrentPosition function', () => {
      const { result } = renderHook(() => useGeolocation());

      expect(typeof result.current.getCurrentPosition).toBe('function');
    });

    it('should provide checkPermission function', () => {
      const { result } = renderHook(() => useGeolocation());

      expect(typeof result.current.checkPermission).toBe('function');
    });
  });

  describe('getCurrentPosition', () => {
    it('should set loading state while getting position', async () => {
      mockGeolocation.getCurrentPosition.mockImplementation(() => {
        // Don't call callback to simulate loading
      });

      const { result } = renderHook(() => useGeolocation());

      act(() => {
        result.current.getCurrentPosition();
      });

      expect(result.current.isLoading).toBe(true);
    });

    it('should return position on success', async () => {
      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.006,
          accuracy: 10,
        },
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });

      const { result } = renderHook(() => useGeolocation());

      let position;
      await act(async () => {
        position = await result.current.getCurrentPosition();
      });

      expect(position).toEqual({
        lat: 40.7128,
        lng: -74.006,
        accuracy: 10,
      });
      expect(result.current.position).toEqual({
        lat: 40.7128,
        lng: -74.006,
        accuracy: 10,
      });
      expect(result.current.isLoading).toBe(false);
      expect(result.current.permissionState).toBe('granted');
    });

    it('should warn when accuracy is low but still succeed', async () => {
      const consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const mockPosition = {
        coords: {
          latitude: 40.7128,
          longitude: -74.006,
          accuracy: 150, // Above 100m threshold
        },
      };

      mockGeolocation.getCurrentPosition.mockImplementation((success) => {
        success(mockPosition);
      });

      const { result } = renderHook(() => useGeolocation());

      await act(async () => {
        await result.current.getCurrentPosition();
      });

      expect(consoleWarnSpy).toHaveBeenCalledWith('Location accuracy is low: 150m');
      expect(result.current.position).not.toBeNull();

      consoleWarnSpy.mockRestore();
    });

    it('should handle permission denied error', async () => {
      const mockError = { code: 1, message: 'User denied Geolocation' };

      mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
        error(mockError);
      });

      const { result } = renderHook(() => useGeolocation());

      await act(async () => {
        try {
          await result.current.getCurrentPosition();
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.error).toEqual({
        code: 1,
        message:
          'Location permission denied. Please enable location access in your browser settings.',
      });
      expect(result.current.permissionState).toBe('denied');
      expect(result.current.isLoading).toBe(false);
    });

    it('should handle position unavailable error', async () => {
      const mockError = { code: 2, message: 'Position unavailable' };

      mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
        error(mockError);
      });

      const { result } = renderHook(() => useGeolocation());

      await act(async () => {
        try {
          await result.current.getCurrentPosition();
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.error).toEqual({
        code: 2,
        message:
          'Unable to determine your location. Please check your device location settings and try again.',
      });
      expect(result.current.permissionState).toBe('prompt');
    });

    it('should handle timeout error', async () => {
      const mockError = { code: 3, message: 'Timeout' };

      mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
        error(mockError);
      });

      const { result } = renderHook(() => useGeolocation());

      await act(async () => {
        try {
          await result.current.getCurrentPosition();
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.error).toEqual({
        code: 3,
        message: 'Location request timed out. Please try again.',
      });
    });

    it('should handle unknown error code', async () => {
      const mockError = { code: 999, message: 'Unknown' };

      mockGeolocation.getCurrentPosition.mockImplementation((_, error) => {
        error(mockError);
      });

      const { result } = renderHook(() => useGeolocation());

      await act(async () => {
        try {
          await result.current.getCurrentPosition();
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.error).toEqual({
        code: 999,
        message: 'An unknown error occurred while getting your location.',
      });
    });

    it('should reject when geolocation is not supported', async () => {
      Object.defineProperty(navigator, 'geolocation', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useGeolocation());

      await act(async () => {
        try {
          await result.current.getCurrentPosition();
        } catch (error) {
          expect(error).toEqual({
            code: 0,
            message: 'Geolocation is not supported by this browser',
          });
        }
      });

      expect(result.current.error).toEqual({
        code: 0,
        message: 'Geolocation is not supported by this browser',
      });
    });
  });

  describe('checkPermission', () => {
    it('should return granted permission state', async () => {
      mockPermissions.query.mockResolvedValue({ state: 'granted' });

      const { result } = renderHook(() => useGeolocation());

      let permState;
      await act(async () => {
        permState = await result.current.checkPermission();
      });

      expect(permState).toBe('granted');
      expect(result.current.permissionState).toBe('granted');
    });

    it('should return denied permission state', async () => {
      mockPermissions.query.mockResolvedValue({ state: 'denied' });

      const { result } = renderHook(() => useGeolocation());

      let permState;
      await act(async () => {
        permState = await result.current.checkPermission();
      });

      expect(permState).toBe('denied');
      expect(result.current.permissionState).toBe('denied');
    });

    it('should return prompt when permissions API not supported', async () => {
      Object.defineProperty(navigator, 'permissions', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useGeolocation());

      let permState;
      await act(async () => {
        permState = await result.current.checkPermission();
      });

      expect(permState).toBe('prompt');
    });

    it('should return prompt when query fails', async () => {
      mockPermissions.query.mockRejectedValue(new Error('Not supported'));

      const { result } = renderHook(() => useGeolocation());

      let permState;
      await act(async () => {
        permState = await result.current.checkPermission();
      });

      expect(permState).toBe('prompt');
    });
  });
});
