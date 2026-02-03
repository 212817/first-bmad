// apps/web/src/components/history/HistorySpotItem.tsx
import { useCarTagStore } from '@/stores/carTagStore';
import { TagBadge } from '@/components/spot/TagBadge';
import type { HistorySpotItemProps } from './types';

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
    return `${diffMinutes}m ago`;
  } else if (diffHours < 24) {
    return `${diffHours}h ago`;
  } else {
    return `${diffDays}d ago`;
  }
};

/**
 * List item component for displaying a spot in history view
 * Shows address/coordinates, timestamp, and car tag badge
 */
export const HistorySpotItem = ({ spot, onClick }: HistorySpotItemProps) => {
  const { getTagById } = useCarTagStore();
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
      className="w-full flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors text-left"
      data-testid="history-spot-item"
    >
      {/* Location icon */}
      <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
        <span className="text-lg" aria-hidden="true">
          📍
        </span>
      </div>

      {/* Spot details */}
      <div className="flex-1 min-w-0">
        <p
          className="text-sm font-medium text-gray-900 truncate"
          data-testid="history-spot-location"
        >
          {displayText}
        </p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-xs text-gray-500" data-testid="history-spot-time">
            {formatRelativeTime(spot.savedAt)}
          </span>
          {/* Car tag badge */}
          {carTag && <TagBadge name={carTag.name} color={carTag.color} size="sm" />}
        </div>
      </div>

      {/* Status indicator */}
      {spot.isActive && (
        <span
          className="w-2 h-2 rounded-full bg-green-500 shrink-0"
          title="Active spot"
          aria-label="Active"
        />
      )}
    </button>
  );
};
