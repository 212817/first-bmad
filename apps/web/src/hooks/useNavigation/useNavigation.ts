// apps/web/src/hooks/useNavigation/useNavigation.ts
import { navigationService } from '@/services/navigation/navigation.service';
import type { Spot } from '@/stores/spot.types';
import type { UseNavigationReturn } from './types';

/**
 * Hook for navigating to parking spots via maps apps
 * Provides methods to open walking directions in the appropriate maps app
 *
 * @example
 * ```tsx
 * const { navigateToSpot, canNavigate } = useNavigation();
 *
 * <button
 *   onClick={() => navigateToSpot(spot)}
 *   disabled={!canNavigate(spot)}
 * >
 *   Navigate
 * </button>
 * ```
 */
export const useNavigation = (): UseNavigationReturn => {
  /**
   * Check if navigation is available for a spot
   * A spot can be navigated to if it has coordinates or an address
   */
  const canNavigate = (spot: Spot): boolean => {
    const hasCoordinates = spot.lat !== null && spot.lng !== null;
    const hasAddress = spot.address !== null && spot.address.trim() !== '';
    return hasCoordinates || hasAddress;
  };

  /**
   * Navigate to a spot by opening the maps app with walking directions
   */
  const navigateToSpot = (spot: Spot): void => {
    if (!canNavigate(spot)) {
      return;
    }

    navigationService.navigateTo({
      lat: spot.lat,
      lng: spot.lng,
      address: spot.address,
    });
  };

  return {
    navigateToSpot,
    canNavigate,
    preferredProvider: navigationService.getPreferredProvider(),
  };
};
