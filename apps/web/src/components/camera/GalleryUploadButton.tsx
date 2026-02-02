// apps/web/src/components/camera/GalleryUploadButton.tsx
import { useState } from 'react';
import { useFilePicker } from '@/hooks/useFilePicker/useFilePicker';
import { imageProcessor } from '@/services/image/imageProcessor.service';
import { usePhotoUpload } from '@/hooks/usePhotoUpload/usePhotoUpload';
import type { GalleryUploadButtonProps } from './types';

/** Large file threshold (5MB) */
const LARGE_FILE_THRESHOLD = 5 * 1024 * 1024;

/** Max dimension for large images before compression */
const LARGE_IMAGE_MAX_DIMENSION = 2000;

/**
 * Format file size in MB for display
 */
const formatFileSize = (bytes: number): string => {
  return (bytes / (1024 * 1024)).toFixed(1);
};

/**
 * Gallery upload button component
 * Allows users to select and upload photos from their device gallery
 */
export const GalleryUploadButton = ({
  onPhotoUploaded,
  onError,
  variant = 'secondary',
  className = '',
  disabled = false,
}: GalleryUploadButtonProps) => {
  const { pickImage, isSelecting } = useFilePicker();
  const { uploadPhoto, status, progress } = usePhotoUpload();
  const [isProcessing, setIsProcessing] = useState(false);
  const [largeFileSize, setLargeFileSize] = useState<number | null>(null);

  const isLoading =
    isSelecting || isProcessing || status === 'processing' || status === 'uploading';

  /**
   * Handle gallery upload flow
   */
  const handleUpload = async () => {
    try {
      // Pick image from gallery
      const file = await pickImage();
      if (!file) {
        return; // User cancelled
      }

      setIsProcessing(true);
      setLargeFileSize(null);

      // Check for large files
      if (file.size > LARGE_FILE_THRESHOLD) {
        setLargeFileSize(file.size);
      }

      // Process image: strip EXIF and compress
      // For large images, use a larger max dimension to maintain quality
      const processResult = await imageProcessor.processImage(file, {
        maxDimension: file.size > LARGE_FILE_THRESHOLD ? LARGE_IMAGE_MAX_DIMENSION : 1280,
      });

      setIsProcessing(false);

      // Upload processed image
      const result = await uploadPhoto(processResult.blob);

      setLargeFileSize(null);
      onPhotoUploaded(result.photoUrl);
    } catch (error) {
      setIsProcessing(false);
      setLargeFileSize(null);

      const errorMessage = error instanceof Error ? error.message : 'Failed to upload photo';
      onError?.(errorMessage);
    }
  };

  // Button styles based on variant
  const baseStyles = 'flex items-center justify-center gap-2 rounded-lg font-medium transition-all';
  const variantStyles = {
    primary: 'px-6 py-3 bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-300',
    secondary:
      'px-4 py-2 border border-gray-300 text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400',
  };

  return (
    <div className="flex flex-col items-center gap-2">
      <button
        onClick={handleUpload}
        disabled={disabled || isLoading}
        className={`${baseStyles} ${variantStyles[variant]} ${className}`}
        data-testid="gallery-upload-btn"
      >
        {/* Upload icon */}
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
          />
        </svg>
        <span>
          {isSelecting
            ? 'Selecting...'
            : isProcessing
              ? 'Processing...'
              : status === 'uploading'
                ? 'Uploading...'
                : 'Upload from Gallery'}
        </span>
      </button>

      {/* Progress indicator */}
      {(status === 'processing' || status === 'uploading') && (
        <div className="w-full max-w-xs" data-testid="upload-progress">
          <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1 text-center">{progress}%</p>
        </div>
      )}

      {/* Large file warning */}
      {largeFileSize && isProcessing && (
        <div
          className="flex items-center gap-1 text-amber-600 text-sm"
          data-testid="large-file-warning"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <span>Large file ({formatFileSize(largeFileSize)}MB) - compressing...</span>
        </div>
      )}
    </div>
  );
};
