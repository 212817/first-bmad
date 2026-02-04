// apps/web/src/pages/SpotConfirmationPage.tsx
import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSpotStore } from '@/stores/spotStore';
import { useCarTagStore } from '@/stores/carTagStore';
import { useGuestStore } from '@/stores/guestStore';
import { SpotDetailCard } from '@/components/spot/SpotDetailCard';
import { SpotActions } from '@/components/spot/SpotActions';
import { NoteInput } from '@/components/spot/NoteInput';
import { CarTagSelector } from '@/components/spot/CarTagSelector';
import { CameraCapture } from '@/components/camera/CameraCapture';
import { UploadProgress } from '@/components/ui/UploadProgress';
import { NoCoordinatesWarning } from '@/components/ui/NoCoordinatesWarning';
import { usePhotoUpload } from '@/hooks/usePhotoUpload/usePhotoUpload';
import { useFilePicker } from '@/hooks/useFilePicker/useFilePicker';
import { useReverseGeocode } from '@/hooks/useReverseGeocode/useReverseGeocode';
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
  const { fetchTags, isHydrated: tagsHydrated } = useCarTagStore();
  const { isGuest } = useGuestStore();
  const [showSuccess, setShowSuccess] = useState(true);
  const [showCamera, setShowCamera] = useState(false);
  const [noteValue, setNoteValue] = useState(currentSpot?.note ?? '');
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

  // Fetch address asynchronously if not available (skip for guests)
  const { address: fetchedAddress, isLoading: isAddressLoading } = useReverseGeocode(
    currentSpot?.lat ?? null,
    currentSpot?.lng ?? null,
    currentSpot?.address ?? null,
    { skip: isGuest }
  );

  // Create spot with resolved address for display
  const displaySpot = currentSpot
    ? {
        ...currentSpot,
        address: fetchedAddress ?? currentSpot.address,
      }
    : null;

  // If no spot data, redirect to home
  useEffect(() => {
    if (!currentSpot && !spotId) {
      navigate('/', { replace: true });
    }
  }, [currentSpot, spotId, navigate]);

  // Fetch car tags on mount
  useEffect(() => {
    if (!tagsHydrated) {
      fetchTags();
    }
  }, [tagsHydrated, fetchTags]);

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
   * Handle note text change
   */
  const handleNoteChange = (note: string) => {
    setNoteValue(note);
  };

  /**
   * Save note to spot
   */
  const handleNoteSave = useCallback(async () => {
    if (!currentSpot) return;

    try {
      await updateSpot(currentSpot.id, { note: noteValue.trim() || null });
    } catch (error) {
      console.error('Failed to save note:', error);
      // Revert to original value on error
      setNoteValue(currentSpot.note || '');
    }
  }, [currentSpot, noteValue, updateSpot]);

  /**
   * Handle tag selection - update spot with new car tag
   */
  const handleTagSelect = useCallback(
    async (tagId: string) => {
      if (!currentSpot) return;

      try {
        await updateSpot(currentSpot.id, { carTagId: tagId });
      } catch (error) {
        console.error('Failed to update car tag:', error);
      }
    },
    [currentSpot, updateSpot]
  );

  /**
   * Handle map marker position change - update spot coordinates
   * accuracy=0 indicates manually set position (no GPS uncertainty)
   */
  const handlePositionChange = useCallback(
    async (lat: number, lng: number, accuracy: number) => {
      if (!currentSpot) return;

      try {
        await updateSpot(currentSpot.id, { lat, lng, accuracy });
      } catch (error) {
        console.error('Failed to update position:', error);
      }
    },
    [currentSpot, updateSpot]
  );

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

  // Determine if spot has address but no coordinates (manual entry without geocoding)
  const hasNoCoordinates = !currentSpot.lat && !currentSpot.lng && !!currentSpot.address;

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col"
      data-testid="spot-confirmation-page"
    >
      {/* Camera Capture Modal */}
      {showCamera && <CameraCapture onCapture={handlePhotoCapture} onClose={handleCameraClose} />}

      {/* Success Header - inline and compact */}
      <div className="flex flex-col items-center justify-center py-2">
        <div className="flex items-center gap-2">
          <span
            className={`text-lg text-green-600 transition-all duration-500 ${showSuccess ? 'animate-bounce' : ''}`}
            aria-hidden="true"
          >
            ✓
          </span>
          <h1 className="text-base font-bold text-indigo-900">Spot Saved!</h1>
        </div>
        <p className="text-sm text-gray-500 mt-1">
          Add a photo, note, or adjust the location below
        </p>
      </div>

      {/* Main Content */}
      <main className="flex-1 px-4 pb-4 max-w-5xl mx-auto w-full">
        {/* Two-column layout on large screens */}
        <div className="lg:grid lg:grid-cols-2 lg:gap-6">
          {/* Left Column: Map Card */}
          <div className="lg:order-2">
            <SpotDetailCard
              spot={displaySpot!}
              hideNote
              isAddressLoading={isAddressLoading}
              editable={true}
              onPositionChange={handlePositionChange}
            />
          </div>

          {/* Right Column: Actions & Details */}
          <div className="lg:order-1 flex flex-col">
            {/* Warning for address-only spots without coordinates */}
            {hasNoCoordinates && (
              <div className="mt-4 lg:mt-0">
                <NoCoordinatesWarning />
              </div>
            )}

            {/* Upload Progress Indicator */}
            {showUploadProgress && (
              <div className="mt-4 lg:mt-0" data-testid="photo-upload-section">
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
              <div
                className="mt-4 lg:mt-0 bg-white rounded-xl p-4 shadow-sm"
                data-testid="photo-section"
              >
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

            {/* Note Input Section */}
            <div className="mt-4 lg:mt-4" data-testid="note-section">
              <NoteInput
                value={noteValue}
                onChange={handleNoteChange}
                onSave={handleNoteSave}
                disabled={isSaving}
              />
            </div>

            {/* Action Buttons */}
            <div className="mt-4">
              <SpotActions
                spot={currentSpot}
                onPhotoClick={handlePhotoClick}
                onGalleryClick={handleGalleryClick}
                onTimerClick={handleTimerClick}
              />
            </div>

            {/* Car Tag Selector */}
            <div className="mt-4" data-testid="car-tag-section">
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-700">Car Tag:</span>
                <CarTagSelector
                  selectedTagId={currentSpot.carTagId}
                  onSelect={handleTagSelect}
                  disabled={isSaving}
                />
              </div>
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
          </div>
        </div>
      </main>
    </div>
  );
};
