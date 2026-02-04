// apps/web/src/hooks/useGeolocation/useGeolocation.ts
import { useState } from 'react';
import type {
  GeolocationState,
  GeolocationError,
  Position,
  PermissionState,
  UseGeolocationReturn,
} from './types';

const GEOLOCATION_TIMEOUT = 30000; // 30 seconds

/**
 * Hook for accessing device geolocation
 * Handles permission states, loading, and error handling
 */
export const useGeolocation = (): UseGeolocationReturn => {
  const [state, setState] = useState<GeolocationState>({
    position: null,
    error: null,
    isLoading: false,
    permissionState: 'prompt',
  });

  /**
   * Check current permission state
   */
  const checkPermission = async (): Promise<PermissionState> => {
    if (!navigator.permissions) {
      // Permissions API not supported, assume prompt
      return 'prompt';
    }

    try {
      const result = await navigator.permissions.query({ name: 'geolocation' });
      const permState = result.state as PermissionState;
      setState((s) => ({ ...s, permissionState: permState }));
      return permState;
    } catch {
      // Query failed, assume prompt
      return 'prompt';
    }
  };

  /**
   * Get current position from device
   * Uses getCurrentPosition (more reliable for permission prompts on Safari)
   */
  const getCurrentPosition = (): Promise<Position> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        const error: GeolocationError = {
          code: 0,
          message: 'Geolocation is not supported by this browser',
        };
        setState((s) => ({ ...s, error, isLoading: false }));
        reject(error);
        return;
      }

      setState((s) => ({ ...s, isLoading: true, error: null }));

      // Use getCurrentPosition - more reliable for triggering permission prompts
      navigator.geolocation.getCurrentPosition(
        (geoPosition) => {
          const position: Position = {
            lat: geoPosition.coords.latitude,
            lng: geoPosition.coords.longitude,
            accuracy: geoPosition.coords.accuracy,
          };

          setState((s) => ({
            ...s,
            position,
            isLoading: false,
            permissionState: 'granted',
            error: null,
          }));

          resolve(position);
        },
        (geoError) => {
          const error: GeolocationError = {
            code: geoError.code,
            message: getErrorMessage(geoError.code),
          };

          const permState: PermissionState = geoError.code === 1 ? 'denied' : 'prompt';

          setState((s) => ({
            ...s,
            error,
            isLoading: false,
            permissionState: permState,
          }));

          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: GEOLOCATION_TIMEOUT,
          maximumAge: 0,
        }
      );
    });
  };

  return {
    ...state,
    getCurrentPosition,
    checkPermission,
  };
};

/**
 * Convert geolocation error code to user-friendly message
 */
const getErrorMessage = (code: number): string => {
  switch (code) {
    case 1:
      // Provide iOS-specific instructions since Safari can't re-prompt
      return 'Location permission denied. Please enable location access in your browser settings.';
    case 2:
      return 'Unable to determine your location. Please check your device location settings and try again.';
    case 3:
      return 'Location request timed out. Please try again.';
    default:
      return 'An unknown error occurred while getting your location.';
  }
};
