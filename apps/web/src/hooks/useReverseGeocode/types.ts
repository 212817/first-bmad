// apps/web/src/hooks/useReverseGeocode/types.ts

/**
 * State returned by the useReverseGeocode hook
 */
export interface UseReverseGeocodeState {
  /** The resolved address, or null if not yet available */
  address: string | null;
  /** Whether the address is currently being fetched */
  isLoading: boolean;
  /** Error message if fetch failed */
  error: string | null;
}

/**
 * Options for the useReverseGeocode hook
 */
export interface UseReverseGeocodeOptions {
  /** Delay in ms before fetching (allows backend async to complete first) */
  delay?: number;
  /** Whether to skip fetching (e.g., for guest users) */
  skip?: boolean;
}
