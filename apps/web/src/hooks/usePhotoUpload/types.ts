// apps/web/src/hooks/usePhotoUpload/types.ts

/**
 * Upload progress state
 */
export type UploadStatus = 'idle' | 'processing' | 'uploading' | 'success' | 'error';

/**
 * Upload error
 */
export interface UploadError {
  code: string;
  message: string;
}

/**
 * Upload result
 */
export interface UploadResult {
  /** Public URL of the uploaded photo */
  photoUrl: string;
  /** Storage key for the photo */
  key: string;
}

/**
 * Upload state
 */
export interface UploadState {
  status: UploadStatus;
  progress: number; // 0-100
  error: UploadError | null;
  result: UploadResult | null;
}

/**
 * Photo upload hook return type
 */
export interface UsePhotoUploadReturn extends UploadState {
  /**
   * Upload a photo blob
   * Processes (compresses/strips EXIF) and uploads to R2
   */
  uploadPhoto: (blob: Blob) => Promise<UploadResult>;

  /**
   * Delete a previously uploaded photo
   */
  deletePhoto: (key: string) => Promise<void>;

  /**
   * Reset state to idle
   */
  reset: () => void;
}

/**
 * API response for upload URL
 */
export interface GetUploadUrlResponse {
  uploadUrl: string;
  key: string;
  publicUrl: string;
  expiresIn: number;
}
