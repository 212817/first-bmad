// apps/web/src/components/spot/SpotDetailCard.tsx
import { Suspense, lazy } from 'react';

import { SpotAddress } from './SpotAddress';
import { formatRelativeTime } from '@/utils/formatters';
import type { SpotDetailCardProps } from './types';

// Lazy load the map component to avoid blocking initial render
const SpotMap = lazy(() => import('@/components/map').then((m) => ({ default: m.SpotMap })));

/**
 * Format timestamp for display
 */
const formatTimestamp = (isoString: string): string => {
  const date = new Date(isoString);
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
};

/**
 * Card component displaying parking spot details
 */
export const SpotDetailCard = ({
  spot,
  hideNote = false,
  isAddressLoading = false,
  editable = false,
  onPositionChange,
  tagSelector,
}: SpotDetailCardProps) => {
  const hasCoordinates = spot.lat !== null && spot.lng !== null;

  return (
    <div className="bg-white rounded-xl shadow-md overflow-visible" data-testid="spot-detail-card">
      {/* Map or Placeholder */}
      <div className="overflow-hidden rounded-t-xl">
        {hasCoordinates ? (
          <Suspense
            fallback={
              <div className="aspect-square bg-gray-200 flex items-center justify-center">
                <div className="flex flex-col items-center gap-2 text-gray-500">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                  <span className="text-sm">Loading map...</span>
                </div>
              </div>
            }
          >
            <SpotMap
              lat={spot.lat!}
              lng={spot.lng!}
              editable={editable}
              onPositionChange={onPositionChange}
              heightClass="aspect-square"
            />
          </Suspense>
        ) : (
          <div className="h-40 bg-gray-200 flex items-center justify-center">
            <div className="text-center text-gray-500">
              <span className="text-4xl block mb-2" aria-hidden="true">
                📍
              </span>
              <span className="text-sm">No coordinates available</span>
            </div>
          </div>
        )}
      </div>

      {/* Spot Details */}
      <div className="p-4 space-y-1">
        {/* Address/Coordinates - unified display */}
        <SpotAddress
          lat={spot.lat}
          lng={spot.lng}
          address={spot.address}
          isLoading={isAddressLoading}
        />

        {/* Accuracy and Tag in same row */}
        <div className="flex items-center justify-between ml-7">
          {/* Accuracy (when available and has coords) */}
          {spot.accuracyMeters !== null && spot.lat !== null && spot.lng !== null ? (
            <p className="text-xs text-gray-500">±{spot.accuracyMeters}m accuracy</p>
          ) : (
            <span />
          )}
          {/* Car Tag Selector (inline) */}
          {tagSelector && (
            <div className="flex items-center gap-1" data-testid="spot-car-tag">
              <span className="text-gray-500 text-base font-black" aria-hidden="true">
                #
              </span>
              {tagSelector}
            </div>
          )}
        </div>

        {/* Timestamp */}
        <div className="flex items-center gap-1.5 pt-1 border-t border-gray-100">
          <span className="text-gray-400 text-xs" aria-hidden="true">
            🕐
          </span>
          <div className="text-xs text-gray-500">
            <span data-testid="spot-relative-time">Saved {formatRelativeTime(spot.savedAt)}</span>
            <span className="text-gray-400 ml-1" data-testid="spot-timestamp">
              ({formatTimestamp(spot.savedAt)})
            </span>
          </div>
        </div>

        {/* Floor / Spot Identifier (when available) */}
        {(spot.floor || spot.spotIdentifier) && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            {spot.floor && (
              <span className="bg-gray-100 px-2 py-1 rounded">Floor: {spot.floor}</span>
            )}
            {spot.spotIdentifier && (
              <span className="bg-gray-100 px-2 py-1 rounded">Spot: {spot.spotIdentifier}</span>
            )}
          </div>
        )}

        {/* Note preview (when available and not hidden) */}
        {spot.note && !hideNote && (
          <div className="flex items-start gap-2 pt-2 border-t border-gray-100">
            <span className="text-gray-400" aria-hidden="true">
              📝
            </span>
            <p className="text-sm text-gray-700 line-clamp-2" data-testid="spot-note">
              {spot.note}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
