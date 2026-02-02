// apps/web/src/components/ui/types.ts

/**
 * Upload status type
 */
export type UploadProgressStatus = 'idle' | 'processing' | 'uploading' | 'success' | 'error';

/**
 * Props for UploadProgress component
 */
export interface UploadProgressProps {
  /** Current upload status */
  status: UploadProgressStatus;
  /** Progress percentage (0-100) */
  progress: number;
  /** Error message when status is 'error' */
  errorMessage?: string;
  /** Callback for retry button when in error state */
  onRetry?: () => void;
  /** Callback for cancel/dismiss */
  onCancel?: () => void;
}
