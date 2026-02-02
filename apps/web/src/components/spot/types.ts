// apps/web/src/components/spot/types.ts
import type { Spot } from '@/stores/spot.types';

/**
 * Props for SpotDetailCard component
 */
export interface SpotDetailCardProps {
  spot: Spot;
  showMap?: boolean;
}

/**
 * Props for SpotActions component
 */
export interface SpotActionsProps {
  spot: Spot;
  onPhotoClick?: () => void;
  onNoteClick?: () => void;
  onTagClick?: () => void;
  onTimerClick?: () => void;
}

/**
 * Props for individual action button
 */
export interface ActionButtonProps {
  icon: string;
  label: string;
  onClick?: () => void;
  active?: boolean;
  disabled?: boolean;
  tooltip?: string;
}
