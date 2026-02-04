// apps/web/src/pages/SpotDetailPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSpotStore } from '@/stores/spotStore';
import { useCarTagStore } from '@/stores/carTagStore';
import { navigationService } from '@/services/navigation/navigation.service';
import { LocationCard } from '@/components/spot/LocationCard';
import { SpotPhoto } from '@/components/spot/SpotPhoto';
import { TagBadge } from '@/components/spot/TagBadge';
import { DeleteConfirmDialog } from '@/components/spot/DeleteConfirmDialog';
import { SpotMap } from '@/components/map/SpotMap';
import { formatDateTime } from '@/utils/formatters';
import type { Spot } from '@/stores/spot.types';

/**
 * Default car tag values when no tag is specified
 */
const DEFAULT_TAG_NAME = 'My Car';
const DEFAULT_TAG_COLOR = '#3B82F6';

/**
 * Spot detail page showing full information about a saved parking spot
 * Accessible via /spot/:spotId route
 */
export const SpotDetailPage = () => {
  const { spotId } = useParams<{ spotId: string }>();
  const navigate = useNavigate();
  const { getSpotById, deleteSpot } = useSpotStore();
  const { getTagById, fetchTags } = useCarTagStore();

  const [spot, setSpot] = useState<Spot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPhotoZoomed, setIsPhotoZoomed] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch spot data on mount
  useEffect(() => {
    const loadSpot = async () => {
      if (!spotId) {
        setError('No spot ID provided');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch car tags for display
        await fetchTags();

        const fetchedSpot = await getSpotById(spotId);
        setSpot(fetchedSpot);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load spot');
      } finally {
        setIsLoading(false);
      }
    };

    loadSpot();
  }, [spotId, getSpotById, fetchTags]);

  /**
   * Navigate to the spot using the navigation service
   */
  const handleNavigate = useCallback(() => {
    if (!spot) return;

    navigationService.navigateTo({
      lat: spot.lat,
      lng: spot.lng,
      address: spot.address,
    });
  }, [spot]);

  /**
   * Share button placeholder - will be implemented in Epic 4
   */
  const handleShare = useCallback(() => {
    // Placeholder for Epic 4
  }, []);

  /**
   * Open delete confirmation dialog
   */
  const handleDeleteClick = useCallback(() => {
    setDeleteDialogOpen(true);
  }, []);

  /**
   * Handle delete confirmation
   */
  const handleDeleteConfirm = useCallback(async () => {
    if (!spotId) return;

    setIsDeleting(true);
    const success = await deleteSpot(spotId);
    setIsDeleting(false);

    if (success) {
      setDeleteDialogOpen(false);
      // Navigate to history after successful deletion
      navigate('/history');
    }
  }, [spotId, deleteSpot, navigate]);

  /**
   * Navigate back to previous page
   */
  const handleBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  /**
   * Toggle photo zoom state
   */
  const handlePhotoTap = useCallback(() => {
    setIsPhotoZoomed((prev) => !prev);
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div
        className="min-h-screen bg-gray-50 flex items-center justify-center"
        data-testid="spot-detail-loading"
      >
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <div
            className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"
            aria-hidden="true"
          />
          <span>Loading spot...</span>
        </div>
      </div>
    );
  }

  // Error or not found state
  if (error || !spot) {
    return (
      <div className="min-h-screen bg-gray-50" data-testid="spot-detail-not-found">
        <div className="relative bg-gray-200 h-48 flex items-center justify-center">
          <span className="text-6xl" aria-hidden="true">
            📍
          </span>
          <button
            onClick={handleBack}
            className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm p-2 rounded-full shadow-md hover:bg-white transition-colors"
            aria-label="Go back"
          >
            <span className="text-xl">←</span>
          </button>
        </div>
        <div className="p-4 text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Spot Not Found</h1>
          <p className="text-gray-600 mb-4">{error || 'This parking spot could not be found.'}</p>
          <button
            onClick={() => navigate('/history')}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            View All Spots
          </button>
        </div>
      </div>
    );
  }

  // Get car tag info
  const carTag = spot.carTagId ? getTagById(spot.carTagId) : null;
  const tagName = carTag?.name ?? DEFAULT_TAG_NAME;
  const tagColor = carTag?.color ?? DEFAULT_TAG_COLOR;

  // Check if navigation is possible
  const canNavigate = spot.lat !== null && spot.lng !== null;

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center" data-testid="spot-detail-page">
      <div className="w-full max-w-7xl bg-white min-h-screen relative shadow-xl flex flex-col">
        {/* Header - Sticky top */}
        <div className="h-16 px-4 sm:px-6 lg:px-8 border-b border-gray-200 flex items-center bg-white sticky top-0 z-30">
          <button
            onClick={handleBack}
            className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors text-gray-700 flex items-center gap-2"
            aria-label="Go back"
          >
            <span className="text-xl" aria-hidden="true">
              ←
            </span>
            <span className="font-medium">Back</span>
          </button>
          <h1 className="ml-4 font-semibold text-lg text-gray-900">Spot Details</h1>
        </div>

        {/* Top Section: Map (left) + Photo (right) side by side - fixed height */}
        <div className="grid grid-cols-2 gap-0.5 bg-gray-100 h-96 shrink-0">
          {/* Map Preview - Left side */}
          <div
            className="h-full bg-gray-200 overflow-hidden relative"
            data-testid="spot-map-preview"
          >
            {canNavigate ? (
              <SpotMap
                lat={spot.lat!}
                lng={spot.lng!}
                editable={false}
                heightClass="h-full"
                testId="spot-detail-map"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-5xl" aria-hidden="true">
                  🗺️
                </span>
              </div>
            )}
          </div>

          {/* Photo - Right side */}
          <div className="h-full bg-gray-200 overflow-hidden relative">
            {spot.photoUrl ? (
              <SpotPhoto
                url={spot.photoUrl}
                alt="Parking spot"
                isZoomed={isPhotoZoomed}
                onTap={handlePhotoTap}
                className="!h-full"
              />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center"
                data-testid="spot-photo-placeholder"
              >
                <span className="text-5xl" aria-hidden="true">
                  📷
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Content below */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-4">
          {/* Location */}
          <LocationCard address={spot.address} lat={spot.lat} lng={spot.lng} />

          {/* Metadata: Timestamp and Tag */}
          <div className="flex items-center justify-between">
            <time className="text-sm text-gray-500" data-testid="spot-timestamp">
              Saved {formatDateTime(spot.savedAt)}
            </time>
            <TagBadge name={tagName} color={tagColor} />
          </div>

          {/* Note */}
          {spot.note && (
            <div className="bg-white p-4 rounded-lg border border-gray-200" data-testid="spot-note">
              <p className="text-gray-700 whitespace-pre-wrap">{spot.note}</p>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-3 pt-4">
            {/* Navigate button */}
            <button
              onClick={handleNavigate}
              disabled={!canNavigate}
              className={`w-full h-12 rounded-lg font-medium flex items-center justify-center gap-2 transition-colors ${
                canNavigate
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              data-testid="navigate-button"
            >
              <span aria-hidden="true">🧭</span>
              Navigate
            </button>

            {/* Share and Delete buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleShare}
                disabled
                className="flex-1 h-12 bg-white border border-gray-200 rounded-lg font-medium flex items-center justify-center gap-2 text-gray-400 cursor-not-allowed"
                title="Coming soon"
                data-testid="share-button"
              >
                <span aria-hidden="true">🔗</span>
                Share
              </button>

              <button
                onClick={handleDeleteClick}
                className="w-12 h-12 bg-white border border-red-200 rounded-lg flex items-center justify-center text-red-600 hover:bg-red-50 transition-colors"
                aria-label="Delete spot"
                data-testid="delete-button"
              >
                <span aria-hidden="true">🗑️</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation dialog */}
      <DeleteConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        spotAddress={spot.address}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
      />
    </div>
  );
};
