// apps/web/src/components/spot/LatestSpotCard.tsx
import { TagBadge } from './TagBadge';
import { SpotThumbnail } from './SpotThumbnail';
import { EmptySpotState } from './EmptySpotState';
import { formatRelativeTime, formatCoordinates } from '@/utils/formatters';
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
  const locationDisplay =
    spot.address ??
    (spot.lat !== null && spot.lng !== null
      ? formatCoordinates(spot.lat, spot.lng)
      : 'Location not available');
  const timeDisplay = formatRelativeTime(spot.savedAt);

  return (
    <div className="bg-white rounded-xl shadow-md p-4" data-testid="latest-spot-card">
      {/* Header: Tag badge and timestamp */}
      <div className="flex justify-between items-center mb-3">
        <TagBadge name={tagName} color={tagColor} />
        <span className="text-sm text-gray-500" data-testid="spot-timestamp">
          {timeDisplay}
        </span>
      </div>

      {/* Content: Photo thumbnail and address */}
      <div className="flex gap-3 mb-4">
        {spot.photoUrl && (
          <SpotThumbnail
            url={spot.photoUrl}
            alt="Parking spot"
            className="w-16 h-16 rounded shrink-0"
          />
        )}
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 truncate" data-testid="spot-location">
            {locationDisplay}
          </p>
          {spot.note && (
            <p className="text-sm text-gray-500 truncate mt-1" data-testid="spot-note">
              {spot.note}
            </p>
          )}
        </div>
      </div>

      {/* Navigate button */}
      <button
        onClick={onNavigate}
        className="w-full h-12 bg-blue-500 hover:bg-blue-600 active:bg-blue-700 text-white rounded-lg font-medium flex items-center justify-center gap-2 transition-colors touch-manipulation"
        data-testid="navigate-button"
      >
        <span className="text-lg" aria-hidden="true">
          🧭
        </span>
        Navigate
      </button>
    </div>
  );
};
