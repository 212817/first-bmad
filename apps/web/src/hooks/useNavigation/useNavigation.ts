// apps/web/src/hooks/useNavigation/useNavigation.ts
import { useState, useCallback } from 'react';
import { navigationService } from '@/services/navigation/navigation.service';
import type { Spot } from '@/stores/spot.types';
import type { MapProvider } from '@/services/navigation/types';
import type { UseNavigationReturn } from './types';

/**
 * Hook for navigating to parking spots via maps apps
 * Shows a picker to let users choose their preferred map app
 *
 * @example
 * ```tsx
 * const { openPicker, isPickerOpen, closePicker, pendingSpot, navigateToSpot, canNavigate } = useNavigation();
 *
 * <button onClick={() => openPicker(spot)} disabled={!canNavigate(spot)}>
 *   Navigate
 * </button>
 * <MapPickerModal
 *   isOpen={isPickerOpen}
 *   onClose={closePicker}
 *   onSelect={(provider) => pendingSpot && navigateToSpot(pendingSpot, provider)}
 * />
 * ```
 */
export const useNavigation = (): UseNavigationReturn => {
  const [isPickerOpen, setIsPickerOpen] = useState(false);
  const [pendingSpot, setPendingSpot] = useState<Spot | null>(null);

  /**
   * Check if navigation is available for a spot
   * A spot can be navigated to if it has coordinates or an address
   */
  const canNavigate = useCallback((spot: Spot): boolean => {
    const hasCoordinates = spot.lat !== null && spot.lng !== null;
    const hasAddress = spot.address !== null && spot.address.trim() !== '';
    return hasCoordinates || hasAddress;
  }, []);

  /**
   * Open the map picker for a spot
   */
  const openPicker = useCallback(
    (spot: Spot): void => {
      if (!canNavigate(spot)) {
        return;
      }
      setPendingSpot(spot);
      setIsPickerOpen(true);
    },
    [canNavigate]
  );

  /**
   * Close the map picker
   */
  const closePicker = useCallback((): void => {
    setIsPickerOpen(false);
    setPendingSpot(null);
  }, []);

  /**
   * Navigate to a spot using the specified map provider
   */
  const navigateToSpot = useCallback(
    (spot: Spot, provider: MapProvider): void => {
      if (!canNavigate(spot)) {
        return;
      }

      navigationService.navigateTo(
        {
          lat: spot.lat,
          lng: spot.lng,
          address: spot.address,
        },
        provider
      );

      closePicker();
    },
    [canNavigate, closePicker]
  );

  return {
    navigateToSpot,
    canNavigate,
    isPickerOpen,
    openPicker,
    closePicker,
    pendingSpot,
  };
};
