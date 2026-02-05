// apps/web/src/hooks/useNavigation/types.ts
import type { Spot } from '@/stores/spot.types';
import type { MapProvider } from '@/services/navigation/types';

/**
 * Return type for useNavigation hook
 */
export interface UseNavigationReturn {
  /** Navigate to a spot using specified provider */
  navigateToSpot: (spot: Spot, provider: MapProvider) => void;
  /** Check if navigation is available for a spot */
  canNavigate: (spot: Spot) => boolean;
  /** Whether the map picker is open */
  isPickerOpen: boolean;
  /** Open the map picker for a spot */
  openPicker: (spot: Spot) => void;
  /** Close the map picker */
  closePicker: () => void;
  /** The spot pending navigation (for picker) */
  pendingSpot: Spot | null;
}
