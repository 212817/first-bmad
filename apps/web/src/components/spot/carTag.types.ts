// apps/web/src/components/spot/carTag.types.ts

/**
 * Car tag data structure
 */
export interface CarTag {
  id: string;
  name: string;
  color: string;
  isDefault: boolean;
}

/**
 * Props for CarTagSelector component
 */
export interface CarTagSelectorProps {
  selectedTagId: string | null;
  onSelect: (tagId: string) => void;
  disabled?: boolean;
  /** Shows spinner instead of chevron and disables dropdown */
  isUpdating?: boolean;
}

/**
 * Props for TagBadge component
 */
export interface TagBadgeProps {
  name: string;
  color: string;
  size?: 'sm' | 'md';
}
