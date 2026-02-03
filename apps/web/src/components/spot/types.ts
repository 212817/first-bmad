// apps/web/src/components/spot/types.ts
import type { Spot } from '@/stores/spot.types';

/**
 * Props for SpotDetailCard component
 */
export interface SpotDetailCardProps {
  spot: Spot;
  showMap?: boolean;
  hideNote?: boolean;
  /** Whether the address is being loaded asynchronously */
  isAddressLoading?: boolean;
  /** Whether the map marker can be dragged to adjust position */
  editable?: boolean;
  /** Callback when marker position changes on the map */
  onPositionChange?: (lat: number, lng: number, accuracy: number) => void;
}

/**
 * Props for SpotActions component
 */
export interface SpotActionsProps {
  spot: Spot;
  onPhotoClick?: () => void;
  onGalleryClick?: () => void;
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

/**
 * Props for NoteInput component
 */
export interface NoteInputProps {
  value: string;
  onChange: (note: string) => void;
  onSave: () => void;
  disabled?: boolean;
}

/**
 * Props for AddressInput component
 */
export interface AddressInputProps {
  /** Callback when address is submitted */
  onSubmit: (address: string) => void;
  /** Whether the form is in loading state */
  isLoading?: boolean;
  /** Whether the input is disabled */
  disabled?: boolean;
}

/**
 * Props for SpotAddress component
 */
export interface SpotAddressProps {
  /** Latitude coordinate */
  lat: number | null;
  /** Longitude coordinate */
  lng: number | null;
  /** Human-readable address */
  address: string | null;
  /** Whether address is being loaded */
  isLoading?: boolean;
}
