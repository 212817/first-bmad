// apps/web/src/services/navigation/types.ts

/**
 * Target for navigation - can be coordinates, address, or both
 */
export interface NavigationTarget {
  /** Latitude coordinate */
  lat?: number | null;
  /** Longitude coordinate */
  lng?: number | null;
  /** Street address for navigation */
  address?: string | null;
}

/**
 * Map provider type
 */
export type MapProvider = 'google' | 'apple';

/**
 * Navigation service interface
 */
export interface NavigationService {
  /** Get the navigation URL for a target with explicit provider */
  getNavigationUrl: (target: NavigationTarget, provider?: MapProvider) => string;
  /** Navigate to a target using specified provider (opens map app) */
  navigateTo: (target: NavigationTarget, provider?: MapProvider) => void;
}
