// apps/web/src/pages/SharedSpotPage.tsx
import { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { shareApi, type SharedSpot } from '@/services/api/shareApi';
import { navigationService } from '@/services/navigation/navigation.service';
import { SpotPhoto } from '@/components/spot/SpotPhoto';
import { SpotMap } from '@/components/map/SpotMap';
import { formatDateTime } from '@/utils/formatters';
import { useAuthStore } from '@/stores/authStore';

/**
 * Public page for viewing a shared parking spot
 * Accessible via /s/:token route (no auth required)
 */
export const SharedSpotPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { authMode } = useAuthStore();
  const isAppUser = authMode === 'authenticated' || authMode === 'guest';

  const [spot, setSpot] = useState<SharedSpot | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPhotoZoomed, setIsPhotoZoomed] = useState(false);
  const [isMapZoomed, setIsMapZoomed] = useState(false);
  const [copiedCoords, setCopiedCoords] = useState(false);

  // Fetch shared spot data on mount
  useEffect(() => {
    const loadSpot = async () => {
      if (!token) {
        setError('Invalid share link');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const fetchedSpot = await shareApi.getSharedSpot(token);
        setSpot(fetchedSpot);
      } catch (err) {
        if (err instanceof Error && err.message.includes('404')) {
          setError('This share link has expired or is invalid');
        } else {
          setError('Failed to load shared spot');
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadSpot();
  }, [token]);

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
   * Toggle photo zoom state
   */
  const handlePhotoTap = useCallback(() => {
    setIsPhotoZoomed((prev) => !prev);
  }, []);

  /**
   * Copy coordinates to clipboard
   */
  const handleCopyCoordinates = useCallback(async () => {
    if (!spot?.lat || !spot?.lng) return;
    const coords = `${spot.lat.toFixed(6)}, ${spot.lng.toFixed(6)}`;
    try {
      await navigator.clipboard.writeText(coords);
      setCopiedCoords(true);
      setTimeout(() => setCopiedCoords(false), 2000);
    } catch {
      console.error('Failed to copy coordinates');
    }
  }, [spot]);

  // Loading state
  if (isLoading) {
    return (
      <div
        className="min-h-screen bg-gray-50 flex items-center justify-center"
        data-testid="shared-spot-loading"
      >
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <div
            className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"
            aria-hidden="true"
          />
          <span>Loading shared spot...</span>
        </div>
      </div>
    );
  }

  // Error or not found state
  if (error || !spot) {
    return (
      <div className="min-h-screen bg-gray-50" data-testid="shared-spot-not-found">
        <div className="relative bg-gray-200 h-48 flex items-center justify-center">
          <span className="text-6xl" aria-hidden="true">
            📍
          </span>
        </div>
        <div className="p-4 text-center">
          <h1 className="text-xl font-bold text-gray-900 mb-2">Link Expired or Invalid</h1>
          <p className="text-gray-600 mb-4">
            {error || 'This share link may have expired or the spot was deleted.'}
          </p>
          <Link
            to="/"
            className="inline-block px-4 py-2 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
          >
            Go to Where Did I Park
          </Link>
        </div>
      </div>
    );
  }

  // Check if navigation is possible
  const canNavigate = spot.lat !== null && spot.lng !== null;

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center" data-testid="shared-spot-page">
      <div className="w-full max-w-7xl bg-white min-h-screen relative shadow-xl flex flex-col">
        {/* Header */}
        <div className="h-16 px-4 sm:px-6 lg:px-8 border-b border-gray-200 flex items-center justify-between bg-white sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <span className="text-2xl" aria-hidden="true">
              📍
            </span>
            <h1 className="font-semibold text-lg text-gray-900">Shared Parking Spot</h1>
          </div>
          {isAppUser ? (
            <button
              onClick={() => navigate(-1)}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              ← Back
            </button>
          ) : (
            <Link to="/" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
              Get the App
            </Link>
          )}
        </div>

        {/* Top Section: Map and/or Photo - reduced height for mobile */}
        <div
          className={`flex bg-gray-100 h-56 sm:h-72 shrink-0 ${spot.photoUrl && canNavigate ? 'gap-0.5' : ''}`}
        >
          {/* Map Preview (clickable to zoom) - full width if no photo */}
          {canNavigate && (
            <div
              className={`h-full bg-gray-200 overflow-hidden relative group ${spot.photoUrl ? 'w-1/2' : 'w-full'}`}
              data-testid="shared-spot-map-preview"
            >
              <SpotMap
                lat={spot.lat!}
                lng={spot.lng!}
                editable={false}
                heightClass="h-full"
                testId="shared-spot-map"
              />
              {/* Map zoom button overlay */}
              <button
                onClick={() => setIsMapZoomed(true)}
                className="absolute inset-0 w-full h-full cursor-zoom-in focus:outline-none"
                aria-label="Expand map"
              >
                {/* Zoom indicator */}
                <div className="absolute bottom-2 left-2 bg-black/50 text-white p-1.5 rounded-md opacity-70 group-hover:opacity-100 transition-opacity">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
                    />
                  </svg>
                </div>
              </button>
            </div>
          )}

          {/* Photo (clickable to zoom) - full width if no map */}
          {spot.photoUrl && (
            <div
              className={`h-full bg-gray-200 overflow-hidden relative group ${canNavigate ? 'w-1/2' : 'w-full'}`}
            >
              <SpotPhoto
                url={spot.photoUrl}
                alt="Parking spot"
                isZoomed={isPhotoZoomed}
                onTap={handlePhotoTap}
                className="!h-full"
              />
              {/* Zoom indicator (when not zoomed) */}
              {!isPhotoZoomed && (
                <div className="absolute bottom-2 right-2 bg-black/50 text-white p-1.5 rounded-md opacity-70 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                    />
                  </svg>
                </div>
              )}
            </div>
          )}

          {/* Fallback when neither map nor photo available */}
          {!canNavigate && !spot.photoUrl && (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-5xl" aria-hidden="true">
                📍
              </span>
            </div>
          )}
        </div>

        {/* Map zoom modal */}
        {isMapZoomed && canNavigate && (
          <div
            className="fixed inset-0 z-[9999] bg-black/90 flex flex-col"
            onClick={() => setIsMapZoomed(false)}
            role="dialog"
            aria-modal="true"
            aria-label="Expanded map"
          >
            {/* Header with close button */}
            <div className="flex items-center justify-end p-4 shrink-0">
              <button
                className="bg-white/90 text-gray-800 w-10 h-10 rounded-full hover:bg-white transition-colors flex items-center justify-center text-xl font-bold"
                onClick={() => setIsMapZoomed(false)}
                aria-label="Close"
              >
                ✕
              </button>
            </div>
            {/* Map container */}
            <div
              className="flex-1 mx-4 mb-4 rounded-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <SpotMap
                lat={spot.lat!}
                lng={spot.lng!}
                editable={false}
                heightClass="h-full"
                testId="shared-spot-map-zoomed"
              />
            </div>
          </div>
        )}

        {/* Content below */}
        <div className="p-4 sm:p-6 lg:p-8 space-y-4">
          {/* Address */}
          {spot.address && (
            <p className="text-gray-700 font-medium" data-testid="shared-spot-address">
              {spot.address}
            </p>
          )}

          {/* Coordinates with tap to copy */}
          {canNavigate && (
            <button
              onClick={handleCopyCoordinates}
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
              data-testid="shared-spot-coordinates"
            >
              <span>
                {spot.lat!.toFixed(4)}°N, {spot.lng!.toFixed(4)}°E
              </span>
              <span
                className={`transition-colors ${copiedCoords ? 'text-green-600' : 'text-gray-400'}`}
              >
                {copiedCoords ? 'Copied!' : 'Tap to copy'}
              </span>
            </button>
          )}

          {/* Navigate button - moved up for visibility */}
          <div className="pt-2">
            <button
              onClick={handleNavigate}
              disabled={!canNavigate}
              className={`w-full h-14 rounded-lg font-medium flex items-center justify-center gap-2 text-lg transition-colors ${
                canNavigate
                  ? 'bg-indigo-600 hover:bg-indigo-700 text-white'
                  : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }`}
              data-testid="shared-spot-navigate-button"
            >
              <span aria-hidden="true">🧭</span>
              Navigate to Spot
            </button>
          </div>

          {/* Metadata: Timestamp - moved below navigate button */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <time data-testid="shared-spot-timestamp">Saved {formatDateTime(spot.savedAt)}</time>
            <span className="text-xs text-gray-400">Expires {formatDateTime(spot.expiresAt)}</span>
          </div>

          {/* Note */}
          {spot.note && (
            <div
              className="bg-white p-4 rounded-lg border border-gray-200"
              data-testid="shared-spot-note"
            >
              <p className="text-gray-700 whitespace-pre-wrap">{spot.note}</p>
            </div>
          )}

          {/* Floor/Identifier info */}
          {(spot.floor || spot.spotIdentifier) && (
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 flex gap-4">
              {spot.floor && (
                <div>
                  <span className="text-xs text-gray-500 uppercase">Floor</span>
                  <p className="font-medium text-gray-900">{spot.floor}</p>
                </div>
              )}
              {spot.spotIdentifier && (
                <div>
                  <span className="text-xs text-gray-500 uppercase">Spot</span>
                  <p className="font-medium text-gray-900">{spot.spotIdentifier}</p>
                </div>
              )}
            </div>
          )}

          {/* App promo */}
          <div className="text-center pt-4 text-sm text-gray-500">
            <p>
              Save your own parking spots with{' '}
              <Link to="/" className="text-indigo-600 hover:text-indigo-800 font-medium">
                Where Did I Park
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
