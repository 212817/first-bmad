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
  /** Optional car tag selector component to render inline */
  tagSelector?: React.ReactNode;
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

/**
 * Props for LatestSpotCard component
 */
export interface LatestSpotCardProps {
  /** The spot to display, or null to show empty state */
  spot: Spot | null;
  /** Car tag name for display */
  carTagName?: string | null;
  /** Car tag color for display */
  carTagColor?: string;
  /** Callback when navigate button is clicked */
  onNavigate: () => void;
  /** Whether the card is loading */
  isLoading?: boolean;
}

/**
 * Props for EmptySpotState component
 */
export interface EmptySpotStateProps {
  /** Additional CSS classes */
  className?: string;
  /** Custom test ID for E2E testing */
  testId?: string;
}

/**
 * Props for SpotThumbnail component
 */
export interface SpotThumbnailProps {
  /** URL of the photo to display */
  url: string;
  /** Alt text for accessibility */
  alt?: string;
  /** Additional CSS classes */
  className?: string;
}

/**
 * Props for SpotSearchInput component
 */
export interface SpotSearchInputProps {
  /** Current search value */
  value: string;
  /** Callback when search value changes (debounced) */
  onChange: (value: string) => void;
  /** Placeholder text */
  placeholder?: string;
  /** Whether to auto-focus on mount */
  autoFocus?: boolean;
}

/**
 * Props for SpotFilters component
 */
export interface SpotFiltersProps {
  /** Currently selected car tag ID */
  selectedTagId?: string;
  /** Callback when tag selection changes (passes tag ID) */
  onTagChange: (tagId: string | undefined) => void;
}

/**
 * Props for NoResultsState component
 */
export interface NoResultsStateProps {
  /** Callback when clear filters is clicked */
  onClear: () => void;
}

/**
 * Props for ShareButton component
 */
export interface ShareButtonProps {
  /** ID of the spot to share */
  spotId: string;
  /** Address or label to display when sharing */
  spotAddress?: string;
  /** Variant style */
  variant?: 'primary' | 'secondary' | 'icon';
  /** Additional CSS classes */
  className?: string;
}
