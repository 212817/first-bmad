// apps/web/src/components/history/HistorySpotItem.tsx
import { useCarTagStore } from '@/stores/carTagStore';
import { TagBadge } from '@/components/spot/TagBadge';
import { SpotThumbnail } from '@/components/spot/SpotThumbnail';
import { formatRelativeTime } from '@/utils/formatters';
import type { HistorySpotItemProps } from './types';

/**
 * List item component for displaying a spot in history view
 * Shows address/coordinates, timestamp, car tag badge, photo thumbnail, and note preview
 */
export const HistorySpotItem = ({ spot, onClick }: HistorySpotItemProps) => {
  const { getTagById } = useCarTagStore();

  // Resolve car tag from ID (all spots should have carTagId set)
  const carTag = spot.carTagId ? getTagById(spot.carTagId) : null;

  // Determine primary display text
  const displayText =
    spot.address ||
    (spot.lat !== null && spot.lng !== null
      ? `${spot.lat.toFixed(4)}°, ${spot.lng.toFixed(4)}°`
      : 'Unknown location');

  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 p-3 bg-white border-b border-gray-200 hover:bg-gray-50 transition-colors text-left"
      data-testid="history-spot-item"
    >
      {/* Photo thumbnail or location icon */}
      {spot.photoUrl ? (
        <SpotThumbnail
          url={spot.photoUrl}
          alt="Parking spot"
          className="w-12 h-12 rounded-lg shrink-0 object-cover"
        />
      ) : (
        <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
          <span className="text-xl text-gray-400" aria-hidden="true">
            📍
          </span>
        </div>
      )}

      {/* Spot details */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium text-gray-900 truncate"
          data-testid="history-spot-location"
        >
          {displayText}
        </p>
        {/* Note preview */}
        {spot.note && (
          <p className="text-xs text-gray-500 truncate mt-0.5" data-testid="history-spot-note">
            {spot.note}
          </p>
        )}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-400" data-testid="history-spot-time">
            {formatRelativeTime(spot.savedAt)}
          </span>
          {/* Car tag badge */}
          {carTag && <TagBadge name={carTag.name} color={carTag.color} size="sm" />}
        </div>
      </div>

      {/* Active indicator and chevron */}
      <div className="flex items-center gap-2 shrink-0">
        {spot.isActive && (
          <span
            className="w-2 h-2 rounded-full bg-green-500"
            title="Active spot"
            aria-label="Active"
          />
        )}
        <span className="text-gray-400" aria-hidden="true">
          ›
        </span>
      </div>
    </button>
  );
};
