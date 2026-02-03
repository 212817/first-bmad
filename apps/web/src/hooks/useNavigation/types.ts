// apps/web/src/hooks/useNavigation/types.ts
import type { Spot } from '@/stores/spot.types';
import type { MapProvider } from '@/services/navigation/types';

/**
 * Return type for useNavigation hook
 */
export interface UseNavigationReturn {
  /** Navigate to a spot (opens map app with walking directions) */
  navigateToSpot: (spot: Spot) => void;
  /** Check if navigation is available for a spot */
  canNavigate: (spot: Spot) => boolean;
  /** Get the preferred map provider for the current platform */
  preferredProvider: MapProvider;
}
