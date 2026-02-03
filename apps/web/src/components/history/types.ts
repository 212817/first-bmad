// apps/web/src/components/history/types.ts
import type { Spot } from '@/stores/spot.types';

/**
 * Props for HistorySpotItem component
 */
export interface HistorySpotItemProps {
  spot: Spot;
  onClick?: () => void;
}
