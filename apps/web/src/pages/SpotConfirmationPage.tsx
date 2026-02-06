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
import { ShareButton } from '@/components/spot/ShareButton';
import { CameraCapture } from '@/components/camera/CameraCapture';
import { UploadProgress } from '@/components/ui/UploadProgress';
import { NoCoordinatesWarning } from '@/components/ui/NoCoordinatesWarning';
import { MapPickerModal } from '@/components/navigation';
import { MeterTimerInput } from '@/components/timer';
import { usePhotoUpload } from '@/hooks/usePhotoUpload/usePhotoUpload';
import { useFilePicker } from '@/hooks/useFilePicker/useFilePicker';
import { useReverseGeocode } from '@/hooks/useReverseGeocode/useReverseGeocode';
import { useNavigation } from '@/hooks/useNavigation/useNavigation';
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
  const { currentSpot, updateSpot, isSaving, getSpotById, setCurrentSpot } = useSpotStore();
  const { fetchTags, isHydrated: tagsHydrated } = useCarTagStore();
  const { isGuest } = useGuestStore();
  const { openPicker, closePicker, isPickerOpen, pendingSpot, navigateToSpot } = useNavigation();
  const [showSuccess, setShowSuccess] = useState(true);
  const [showCamera, setShowCamera] = useState(false);
  const [showMeterTimer, setShowMeterTimer] = useState(false);
  const [noteValue, setNoteValue] = useState(currentSpot?.note ?? '');
  const [pendingRetryBlob, setPendingRetryBlob] = useState<Blob | null>(null);
  const [isProcessingGallery, setIsProcessingGallery] = useState(false);
  const [isPhotoZoomed, setIsPhotoZoomed] = useState(false);
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

  // If no spot data, try to fetch by ID or redirect to home
  useEffect(() => {
    const loadSpot = async () => {
      // No spotId at all - redirect
      if (!spotId) {
        navigate('/', { replace: true });
        return;
      }

      // Already have the spot loaded
      if (currentSpot?.id === spotId) {
        return;
      }

      // Try to fetch the spot by ID
      try {
        const spot = await getSpotById(spotId);
        if (spot) {
          setCurrentSpot(spot);
          setNoteValue(spot.note ?? '');
        } else {
          // Spot not found - redirect
          navigate('/', { replace: true });
        }
      } catch (error) {
        console.error('Failed to load spot:', error);
        navigate('/', { replace: true });
      }
    };

    loadSpot();
  }, [spotId, currentSpot?.id, navigate, getSpotById, setCurrentSpot]);

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
   * Handle Navigate Now button - open map picker
   */
  const handleNavigate = useCallback(() => {
    if (!currentSpot) return;
    openPicker(currentSpot);
  }, [currentSpot, openPicker]);

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
   * Handle Timer action button click - toggle meter timer section
   */
  const handleTimerClick = () => {
    setShowMeterTimer((prev) => !prev);
  };

  /**
   * Handle meter timer change - update spot with new expiry time
   */
  const handleMeterTimerChange = useCallback(
    async (expiresAt: string | null) => {
      if (!currentSpot) return;

      try {
        await updateSpot(currentSpot.id, { meterExpiresAt: expiresAt });
      } catch (error) {
        console.error('Failed to update meter timer:', error);
      }
    },
    [currentSpot, updateSpot]
  );

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
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col relative"
      data-testid="spot-confirmation-page"
    >
      {/* Camera Capture Modal */}
      {showCamera && <CameraCapture onCapture={handlePhotoCapture} onClose={handleCameraClose} />}

      {/* Close button - top right */}
      <button
        onClick={handleDone}
        className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-lg bg-white/80 hover:bg-white text-gray-600 hover:text-gray-900 shadow-sm transition-colors z-10"
        aria-label="Close"
        data-testid="close-button"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

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
      <main className="flex-1 px-4 pb-24 max-w-5xl mx-auto w-full">
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
              tagSelector={
                <CarTagSelector
                  selectedTagId={currentSpot.carTagId}
                  onSelect={handleTagSelect}
                  disabled={isSaving}
                />
              }
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
                  <button
                    onClick={() => setIsPhotoZoomed(true)}
                    className="relative w-20 h-20 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 cursor-zoom-in group"
                    aria-label="Zoom photo"
                  >
                    <img
                      src={currentSpot.photoUrl!}
                      alt="Parking spot photo"
                      className="w-full h-full object-cover"
                      data-testid="photo-thumbnail"
                    />
                    {/* Zoom indicator */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 bg-black/50 text-white p-1 rounded-md transition-opacity">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                          />
                        </svg>
                      </div>
                    </div>
                  </button>
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

            {/* Photo zoom modal */}
            {isPhotoZoomed && currentSpot.photoUrl && (
              <div
                className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4"
                onClick={() => setIsPhotoZoomed(false)}
                role="dialog"
                aria-modal="true"
                aria-label="Zoomed photo"
              >
                <button
                  className="absolute top-4 right-4 bg-white/90 text-gray-800 w-10 h-10 rounded-full hover:bg-white transition-colors flex items-center justify-center text-xl font-bold z-[10000]"
                  onClick={() => setIsPhotoZoomed(false)}
                  aria-label="Close"
                >
                  ✕
                </button>
                <img
                  src={currentSpot.photoUrl}
                  alt="Parking spot zoomed"
                  className="max-w-full max-h-full object-contain rounded-lg"
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            )}

            {/* Note Input Section */}
            <div className="mt-2" data-testid="note-section">
              <NoteInput
                value={noteValue}
                onChange={handleNoteChange}
                onSave={handleNoteSave}
                disabled={isSaving}
              />
            </div>

            {/* Meter Timer Section - shown when timer button is clicked */}
            {showMeterTimer && (
              <div
                className="mt-2 bg-white rounded-xl p-4 shadow-sm"
                data-testid="meter-timer-section"
              >
                <MeterTimerInput
                  value={currentSpot.meterExpiresAt}
                  onChange={handleMeterTimerChange}
                  disabled={isSaving}
                />
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-2">
              <SpotActions
                spot={currentSpot}
                onPhotoClick={handlePhotoClick}
                onGalleryClick={handleGalleryClick}
                onTimerClick={handleTimerClick}
              />
            </div>

            {/* Navigation Buttons */}
            <div className="mt-2 space-y-3">
              <button
                onClick={handleNavigate}
                className="w-full h-12 border-2 border-indigo-500 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
                data-testid="navigate-button"
              >
                Navigate Now
              </button>
              <div className="flex gap-3">
                {!isGuest && (
                  <ShareButton
                    spotId={currentSpot.id}
                    spotAddress={displaySpot?.address || undefined}
                    variant="secondary"
                    className="flex-1 h-12"
                  />
                )}
                <button
                  onClick={handleDone}
                  className={`h-12 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors ${isGuest ? 'w-full' : 'flex-1'}`}
                  data-testid="done-button"
                >
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Map Picker Modal */}
      <MapPickerModal
        isOpen={isPickerOpen}
        onClose={closePicker}
        onSelect={(provider) => pendingSpot && navigateToSpot(pendingSpot, provider)}
      />
    </div>
  );
};
