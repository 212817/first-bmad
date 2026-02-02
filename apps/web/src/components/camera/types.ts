// apps/web/src/components/camera/types.ts

/**
 * Camera capture component props
 */
export interface CameraCaptureProps {
  /** Called when a photo is captured */
  onCapture: (blob: Blob) => void;
  /** Called when the camera is closed without capture */
  onClose: () => void;
  /** Whether to show the camera UI - defaults to true if not using isOpen pattern */
  isOpen?: boolean;
  /** Called when user clicks "Upload from Gallery" in permission denied state */
  onGalleryUpload?: () => void;
}

/**
 * Camera permission denied fallback props
 */
export interface CameraPermissionDeniedProps {
  /** Called when user clicks "Upload from Gallery" */
  onUploadFromGallery: () => void;
  /** Called to close the dialog */
  onClose: () => void;
}

/**
 * Photo preview props
 */
export interface PhotoPreviewProps {
  /** The captured photo blob */
  blob: Blob;
  /** Called to confirm and use the photo */
  onConfirm: () => void;
  /** Called to retake the photo */
  onRetake: () => void;
  /** Called to cancel and close */
  onCancel: () => void;
}

/**
 * Gallery upload button variant
 */
export type GalleryUploadButtonVariant = 'primary' | 'secondary';

/**
 * Gallery upload button props
 */
export interface GalleryUploadButtonProps {
  /** Called when photo is successfully uploaded */
  onPhotoUploaded: (url: string) => void;
  /** Called when an error occurs */
  onError?: (message: string) => void;
  /** Visual variant of the button */
  variant?: GalleryUploadButtonVariant;
  /** Additional CSS classes */
  className?: string;
  /** Whether the button is disabled */
  disabled?: boolean;
}
