// apps/web/src/components/spot/LatestSpotCard.tsx
import { useState } from 'react';
import { TagBadge } from './TagBadge';
import { SpotThumbnail } from './SpotThumbnail';
import { EmptySpotState } from './EmptySpotState';
import { ShareButton } from './ShareButton';
import { SpotMap } from '@/components/map/SpotMap';
import { formatRelativeTime } from '@/utils/formatters';
import type { LatestSpotCardProps } from './types';

/**
 * Default car tag values when no tag is specified
 */
const DEFAULT_TAG_NAME = 'My Car';
const DEFAULT_TAG_COLOR = '#3B82F6';

/**
 * Card component for displaying the latest saved parking spot
 * Shows spot info with prominent Navigate button
 * Displays empty state when no spot is available
 */
export const LatestSpotCard = ({
  spot,
  carTagName,
  carTagColor = DEFAULT_TAG_COLOR,
  onNavigate,
  isLoading = false,
}: LatestSpotCardProps) => {
  const [isPhotoZoomed, setIsPhotoZoomed] = useState(false);
  const [isMapZoomed, setIsMapZoomed] = useState(false);

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-md p-4" data-testid="latest-spot-card-loading">
        <div className="animate-pulse space-y-4">
          {/* Header skeleton */}
          <div className="flex justify-between items-center">
            <div className="h-6 w-20 bg-gray-200 rounded-full" />
            <div className="h-4 w-16 bg-gray-200 rounded" />
          </div>
          {/* Content skeleton */}
          <div className="flex gap-3">
            <div className="w-16 h-16 bg-gray-200 rounded" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-3/4 bg-gray-200 rounded" />
              <div className="h-3 w-1/2 bg-gray-200 rounded" />
            </div>
          </div>
          {/* Button skeleton */}
          <div className="h-12 bg-gray-200 rounded-lg" />
        </div>
      </div>
    );
  }

  // Empty state when no spot
  if (!spot) {
    return <EmptySpotState />;
  }

  // Determine display values
  const tagName = carTagName ?? DEFAULT_TAG_NAME;
  const tagColor = carTagColor ?? DEFAULT_TAG_COLOR;
  const timeDisplay = formatRelativeTime(spot.savedAt);

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden" data-testid="latest-spot-card">
      {/* Header: Tag badge and timestamp */}
      <div className="flex justify-between items-center px-4 pt-4 pb-2">
        <TagBadge name={tagName} color={tagColor} />
        <span className="text-sm text-gray-500" data-testid="spot-timestamp">
          {timeDisplay}
        </span>
      </div>

      {/* Map and Photo side by side (50% each), or full width if only one */}
      <div className="flex h-48">
        {/* Map - takes half width if photo exists, full width otherwise */}
        {spot.lat !== null && spot.lng !== null && (
          <div className={`${spot.photoUrl ? 'w-1/2' : 'w-full'} bg-gray-200 relative group`}>
            <SpotMap
              lat={spot.lat}
              lng={spot.lng}
              editable={false}
              heightClass="h-48"
              testId="latest-spot-map"
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
        {/* Photo - only show if photo exists */}
        {spot.photoUrl && (
          <div
            className={`${spot.lat !== null && spot.lng !== null ? 'w-1/2' : 'w-full'} bg-gray-100`}
          >
            <button
              onClick={() => setIsPhotoZoomed(true)}
              className="relative w-full h-48 cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-indigo-500 group"
              aria-label="Zoom photo"
            >
              <SpotThumbnail
                url={spot.photoUrl}
                alt="Parking spot"
                className="w-full h-48 object-cover"
              />
              {/* Zoom indicator */}
              <div className="absolute bottom-2 right-2 bg-black/50 text-white p-1.5 rounded-md opacity-70 group-hover:opacity-100 transition-opacity">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
                  />
                </svg>
              </div>
            </button>
          </div>
        )}
      </div>

      {/* Map zoom modal */}
      {isMapZoomed && spot.lat !== null && spot.lng !== null && (
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
              lat={spot.lat}
              lng={spot.lng}
              editable={false}
              heightClass="h-full"
              testId="latest-spot-map-zoomed"
            />
          </div>
        </div>
      )}

      {/* Photo zoom modal */}
      {isPhotoZoomed && spot.photoUrl && (
        <div
          className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setIsPhotoZoomed(false)}
          role="dialog"
          aria-modal="true"
          aria-label="Zoomed photo"
        >
          <button
            className="absolute top-4 right-4 text-white text-3xl hover:text-gray-300 transition-colors z-[10000]"
            onClick={() => setIsPhotoZoomed(false)}
            aria-label="Close"
          >
            ✕
          </button>
          <img
            src={spot.photoUrl}
            alt="Parking spot zoomed"
            className="max-w-full max-h-full object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      {/* Content: Address, coordinates and note below map/photo */}
      <div className="px-4 py-3">
        <div className="flex items-start gap-2">
          <span className="text-gray-400 shrink-0" aria-hidden="true">
            📍
          </span>
          <div className="flex-1 text-left min-w-0">
            {/* Address or fallback */}
            <p className="text-sm font-medium text-gray-800 truncate" data-testid="spot-location">
              {spot.address ?? 'Address unavailable'}
            </p>
            {/* Coordinates - always show with copy button */}
            {spot.lat !== null && spot.lng !== null && (
              <button
                type="button"
                onClick={() => {
                  const coords = `${spot.lat!.toFixed(6)}, ${spot.lng!.toFixed(6)}`;
                  navigator.clipboard.writeText(coords);
                }}
                className="text-xs text-gray-500 hover:text-indigo-600 mt-0.5 flex items-center gap-1 transition-colors"
                title="Tap to copy coordinates"
              >
                <span>
                  {spot.lat.toFixed(4)}°N, {spot.lng.toFixed(4)}°E
                </span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                  />
                </svg>
              </button>
            )}
            {spot.note && (
              <p className="text-sm text-gray-500 truncate mt-1" data-testid="spot-note">
                {spot.note}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons: Navigate and Share */}
      <div className="px-4 pb-4 flex gap-2">
        <button
          onClick={onNavigate}
          className="flex-1 h-12 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors touch-manipulation"
          data-testid="navigate-button"
        >
          <span className="text-lg" aria-hidden="true">
            🧭
          </span>
          Navigate
        </button>
        <ShareButton
          spotId={spot.id}
          spotAddress={spot.address || undefined}
          variant="icon"
          className="h-12 w-12"
        />
      </div>
    </div>
  );
};
