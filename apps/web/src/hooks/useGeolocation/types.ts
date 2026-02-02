// apps/web/src/hooks/useGeolocation/types.ts

/**
 * Permission state for geolocation
 */
export type PermissionState = 'prompt' | 'granted' | 'denied';

/**
 * Position data from geolocation
 */
export interface Position {
  lat: number;
  lng: number;
  accuracy: number;
}

/**
 * Geolocation error
 */
export interface GeolocationError {
  code: number;
  message: string;
}

/**
 * Geolocation state
 */
export interface GeolocationState {
  position: Position | null;
  error: GeolocationError | null;
  isLoading: boolean;
  permissionState: PermissionState;
}

/**
 * Geolocation hook return type
 */
export interface UseGeolocationReturn extends GeolocationState {
  getCurrentPosition: () => Promise<Position>;
  checkPermission: () => Promise<PermissionState>;
}
