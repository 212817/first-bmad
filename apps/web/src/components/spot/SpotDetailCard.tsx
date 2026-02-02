// apps/web/src/components/spot/SpotDetailCard.tsx
import type { SpotDetailCardProps } from './types';

/**
 * Format coordinates to human-readable string
 */
const formatCoordinates = (lat: number, lng: number): string => {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(6)}° ${latDir}, ${Math.abs(lng).toFixed(6)}° ${lngDir}`;
};

/**
 * Format timestamp to relative time
 */
const formatRelativeTime = (isoString: string): string => {
  const date = new Date(isoString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMinutes < 1) {
    return 'Just now';
  } else if (diffMinutes < 60) {
    return `${diffMinutes} minute${diffMinutes === 1 ? '' : 's'} ago`;
  } else if (diffHours < 24) {
    return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  } else {
    return `${diffDays} day${diffDays === 1 ? '' : 's'} ago`;
  }
};

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
export const SpotDetailCard = ({ spot, hideNote = false }: SpotDetailCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden" data-testid="spot-detail-card">
      {/* Map Preview Placeholder */}
      <div className="h-40 bg-gray-200 flex items-center justify-center">
        <div className="text-center text-gray-500">
          <span className="text-4xl block mb-2" aria-hidden="true">
            📍
          </span>
          <span className="text-sm">Map Preview</span>
        </div>
      </div>

      {/* Spot Details */}
      <div className="p-4 space-y-3">
        {/* Coordinates */}
        <div className="flex items-start gap-2">
          <span className="text-gray-400" aria-hidden="true">
            🗺️
          </span>
          <div>
            <p className="text-sm font-mono text-gray-700" data-testid="spot-coordinates">
              {formatCoordinates(spot.lat, spot.lng)}
            </p>
            {spot.accuracyMeters && (
              <p className="text-xs text-gray-500">±{spot.accuracyMeters}m accuracy</p>
            )}
          </div>
        </div>

        {/* Address (when available) */}
        {spot.address && (
          <div className="flex items-start gap-2">
            <span className="text-gray-400" aria-hidden="true">
              📍
            </span>
            <p className="text-sm text-gray-700" data-testid="spot-address">
              {spot.address}
            </p>
          </div>
        )}

        {/* Timestamp */}
        <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
          <span className="text-gray-400" aria-hidden="true">
            🕐
          </span>
          <div className="text-sm">
            <span className="text-gray-700" data-testid="spot-relative-time">
              Saved {formatRelativeTime(spot.savedAt)}
            </span>
            <span className="text-gray-400 ml-2" data-testid="spot-timestamp">
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
