// apps/web/src/components/history/types.ts
import type { Spot } from '@/stores/spot.types';

/**
 * Props for HistorySpotItem component
 */
export interface HistorySpotItemProps {
  spot: Spot;
  onClick?: () => void;
}

/**
 * Props for SpotList component
 */
export interface SpotListProps {
  /** Array of spots to display */
  spots: Spot[];
  /** Whether there are more spots to load */
  hasMore: boolean;
  /** Whether more spots are currently being loaded */
  isLoadingMore: boolean;
  /** Callback to load more spots */
  loadMore: () => Promise<void>;
  /** Callback when a spot is clicked */
  onSpotClick: (spot: Spot) => void;
}
