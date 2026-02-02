// apps/web/src/pages/SpotConfirmationPage.tsx
import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSpotStore } from '@/stores/spotStore';
import { SpotDetailCard } from '@/components/spot/SpotDetailCard';
import { SpotActions } from '@/components/spot/SpotActions';
import { CameraCapture } from '@/components/camera/CameraCapture';
import { UploadProgress } from '@/components/ui/UploadProgress';
import { usePhotoUpload } from '@/hooks/usePhotoUpload/usePhotoUpload';
import { useFilePicker } from '@/hooks/useFilePicker/useFilePicker';
import { imageProcessor } from '@/services/image/imageProcessor.service';

/** Large file threshold (5MB) for gallery uploads */
const LARGE_FILE_THRESHOLD = 5 * 1024 * 1024;

/** Max dimension for large images before compression */
const LARGE_IMAGE_MAX_DIMENSION = 2000;

/**
 * Confirmation page displayed after successfully saving a parking spot.
 * Shows spot details and allows adding optional info (photo, note, tag).
 */
export const SpotConfirmationPage = () => {
  const { spotId } = useParams<{ spotId: string }>();
  const navigate = useNavigate();
  const { currentSpot, updateSpot, isSaving } = useSpotStore();
  const [showSuccess, setShowSuccess] = useState(true);
  const [showCamera, setShowCamera] = useState(false);
  const [pendingRetryBlob, setPendingRetryBlob] = useState<Blob | null>(null);
  const [isProcessingGallery, setIsProcessingGallery] = useState(false);
  const { pickImage } = useFilePicker();
  const {
    uploadPhoto,
    status: uploadStatus,
    progress: uploadProgress,
    error: uploadError,
    reset: resetUpload,
  } = usePhotoUpload();

  // If no spot data, redirect to home
  useEffect(() => {
    if (!currentSpot && !spotId) {
      navigate('/', { replace: true });
    }
  }, [currentSpot, spotId, navigate]);

  // Hide success animation after delay
  useEffect(() => {
    const timer = setTimeout(() => setShowSuccess(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  /**
   * Handle Done button - return to home screen
   */
  const handleDone = () => {
    navigate('/', { replace: true });
  };

  /**
   * Handle Navigate Now button - placeholder for Epic 3
   */
  const handleNavigate = () => {
    // TODO: Epic 3 - Open maps navigation
    console.log('Navigate - Coming in Epic 3');
  };

  /**
   * Handle Photo action button click - open camera
   */
  const handlePhotoClick = () => {
    setShowCamera(true);
  };

  /**
   * Handle Gallery action button click - pick from gallery
   */
  const handleGalleryClick = useCallback(async () => {
    if (!currentSpot) return;

    try {
      // Pick image from gallery
      const file = await pickImage();
      if (!file) return; // User cancelled

      setIsProcessingGallery(true);

      // Process image: strip EXIF and compress
      // For large images, use a larger max dimension to maintain quality
      const processResult = await imageProcessor.processImage(file, {
        maxDimension: file.size > LARGE_FILE_THRESHOLD ? LARGE_IMAGE_MAX_DIMENSION : 1280,
      });

      setIsProcessingGallery(false);
      setPendingRetryBlob(processResult.blob);

      // Upload the photo
      const result = await uploadPhoto(processResult.blob);

      // Update the spot with the photo URL
      await updateSpot(currentSpot.id, { photoUrl: result.photoUrl });

      // Clear pending blob and reset upload state after success
      setPendingRetryBlob(null);
      resetUpload();
    } catch (error) {
      setIsProcessingGallery(false);
      console.error('Failed to upload gallery photo:', error);
      // Error state is handled by the upload hook
    }
  }, [currentSpot, pickImage, uploadPhoto, updateSpot, resetUpload]);

  /**
   * Handle photo capture from camera
   */
  const handlePhotoCapture = useCallback(
    async (blob: Blob) => {
      if (!currentSpot) return;

      setShowCamera(false);
      setPendingRetryBlob(blob);

      try {
        // Upload the photo
        const result = await uploadPhoto(blob);

        // Update the spot with the photo URL
        await updateSpot(currentSpot.id, { photoUrl: result.photoUrl });

        // Clear pending blob and reset upload state after success
        setPendingRetryBlob(null);
        resetUpload();
      } catch (error) {
        console.error('Failed to upload photo:', error);
        // Error state is handled by the upload hook
        // Keep pendingRetryBlob for retry functionality
      }
    },
    [currentSpot, uploadPhoto, updateSpot, resetUpload]
  );

  /**
   * Handle retry upload after error
   */
  const handleRetryUpload = useCallback(() => {
    if (pendingRetryBlob) {
      resetUpload();
      handlePhotoCapture(pendingRetryBlob);
    }
  }, [pendingRetryBlob, resetUpload, handlePhotoCapture]);

  /**
   * Handle cancel/dismiss upload progress
   */
  const handleCancelUpload = useCallback(() => {
    setPendingRetryBlob(null);
    resetUpload();
  }, [resetUpload]);

  /**
   * Handle camera close
   */
  const handleCameraClose = () => {
    setShowCamera(false);
  };

  /**
   * Handle photo delete
   */
  const handlePhotoDelete = async () => {
    if (!currentSpot) return;

    try {
      await updateSpot(currentSpot.id, { photoUrl: null });
    } catch (error) {
      console.error('Failed to delete photo:', error);
    }
  };

  /**
   * Handle Note action button click
   */
  const handleNoteClick = () => {
    // TODO: Story 2.5 - Add note
    console.log('Add Note - Coming in Story 2.5');
  };

  /**
   * Handle Tag action button click
   */
  const handleTagClick = () => {
    // TODO: Story 2.7 - Car tag selector
    console.log('Set Tag - Coming in Story 2.7');
  };

  /**
   * Handle Timer action button click
   */
  const handleTimerClick = () => {
    // TODO: Epic 4 - Timer functionality
    console.log('Set Timer - Coming in Epic 4');
  };

  // Show loading if no spot available
  if (!currentSpot) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  // Determine if we're in an upload state
  const isUploading =
    isProcessingGallery || uploadStatus === 'processing' || uploadStatus === 'uploading';
  const showUploadProgress =
    isProcessingGallery || (uploadStatus !== 'idle' && uploadStatus !== 'success');
  const hasPhoto = !!currentSpot.photoUrl;

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col"
      data-testid="spot-confirmation-page"
    >
      {/* Camera Capture Modal */}
      {showCamera && <CameraCapture onCapture={handlePhotoCapture} onClose={handleCameraClose} />}

      {/* Success Header */}
      <div className="text-center py-8">
        <div
          className={`text-5xl mb-3 transition-all duration-500 ${showSuccess ? 'animate-bounce' : ''}`}
          aria-hidden="true"
        >
          ✓
        </div>
        <h1 className="text-2xl font-bold text-indigo-900">Spot Saved!</h1>
      </div>

      {/* Main Content */}
      <main className="flex-1 px-4 pb-4 flex flex-col">
        {/* Spot Details Card */}
        <SpotDetailCard spot={currentSpot} />

        {/* Upload Progress Indicator */}
        {showUploadProgress && (
          <div className="mt-4" data-testid="photo-upload-section">
            <UploadProgress
              status={uploadStatus}
              progress={uploadProgress}
              errorMessage={uploadError?.message}
              onRetry={handleRetryUpload}
              onCancel={handleCancelUpload}
            />
          </div>
        )}

        {/* Photo Preview Section */}
        {hasPhoto && !isUploading && (
          <div className="mt-4 bg-white rounded-xl p-4 shadow-sm" data-testid="photo-section">
            <div className="flex items-start gap-3">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                <img
                  src={currentSpot.photoUrl!}
                  alt="Parking spot photo"
                  className="w-full h-full object-cover"
                  data-testid="photo-thumbnail"
                />
              </div>
              <div className="flex-1 flex flex-col gap-2">
                <span className="text-sm text-gray-600">Photo attached</span>
                <div className="flex gap-2">
                  <button
                    onClick={handlePhotoClick}
                    className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                    data-testid="retake-photo-button"
                  >
                    Retake
                  </button>
                  <button
                    onClick={handlePhotoDelete}
                    disabled={isSaving}
                    className="text-sm text-red-600 hover:text-red-700 font-medium disabled:opacity-50"
                    data-testid="delete-photo-button"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-6">
          <SpotActions
            spot={currentSpot}
            onPhotoClick={handlePhotoClick}
            onGalleryClick={handleGalleryClick}
            onNoteClick={handleNoteClick}
            onTagClick={handleTagClick}
            onTimerClick={handleTimerClick}
          />
        </div>

        {/* Navigation Buttons */}
        <div className="mt-auto pt-6 space-y-3">
          <button
            onClick={handleNavigate}
            className="w-full h-12 border-2 border-indigo-500 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
            data-testid="navigate-button"
          >
            Navigate Now
          </button>
          <button
            onClick={handleDone}
            className="w-full h-12 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            data-testid="done-button"
          >
            Done
          </button>
        </div>
      </main>
    </div>
  );
};
