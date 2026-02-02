// apps/web/src/hooks/useFilePicker/types.ts

/**
 * Accepted image MIME types for file picker
 */
export const ACCEPTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
] as const;

/**
 * Accept string for file input element
 */
export const ACCEPT_IMAGE_STRING = ACCEPTED_IMAGE_TYPES.join(',');

/**
 * Options for picking an image
 */
export interface PickImageOptions {
  /** Custom accept types, defaults to ACCEPTED_IMAGE_TYPES */
  accept?: string;
}

/**
 * Result of a successful file pick
 */
export interface FilePickResult {
  /** The selected file */
  file: File;
  /** Whether the file is potentially a HEIC image that needs conversion */
  isHeic: boolean;
}

/**
 * File picker hook return type
 */
export interface UseFilePickerReturn {
  /**
   * Trigger file picker and wait for selection
   * Returns null if user cancels
   */
  pickImage: (options?: PickImageOptions) => Promise<File | null>;

  /**
   * Whether the file picker is currently open
   */
  isSelecting: boolean;

  /**
   * The underlying file input element ref (for testing)
   */
  inputRef: React.RefObject<HTMLInputElement | null>;

  /**
   * Reset state (for cleanup)
   */
  reset: () => void;
}
