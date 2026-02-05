// apps/web/src/components/spot/LocationCard.tsx
import { TagBadge } from './TagBadge';

/**
 * Props for LocationCard component
 */
interface LocationCardProps {
  address: string | null;
  lat: number | null;
  lng: number | null;
  /** Optional car tag to display */
  tagName?: string;
  tagColor?: string;
}

/**
 * Card component displaying location information
 * Shows address and coordinates with copy functionality
 */
export const LocationCard = ({ address, lat, lng, tagName, tagColor }: LocationCardProps) => {
  const hasCoordinates = lat !== null && lng !== null;
  const hasTag = tagName && tagColor;

  const handleCopyCoordinates = () => {
    if (!hasCoordinates) return;
    const coords = `${lat!.toFixed(6)}, ${lng!.toFixed(6)}`;
    navigator.clipboard.writeText(coords);
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200" data-testid="location-card">
      <div className="flex items-start gap-3">
        <span className="text-gray-400 shrink-0" aria-hidden="true">
          📍
        </span>
        <div className="flex-1 min-w-0 text-left">
          {/* Address or unavailable */}
          <p className="text-sm font-medium text-gray-800" data-testid="location-address">
            {address ?? 'Address unavailable'}
          </p>
          {/* Coordinates and Tag row */}
          <div className="flex items-center justify-between mt-0.5">
            {/* Coordinates - always show with copy button */}
            {hasCoordinates && (
              <button
                type="button"
                onClick={handleCopyCoordinates}
                className="text-xs text-gray-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                title="Tap to copy coordinates"
                data-testid="location-coordinates"
              >
                <span>
                  {lat!.toFixed(4)}°N, {lng!.toFixed(4)}°E
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
            {/* Car tag - aligned right */}
            {hasTag && <TagBadge name={tagName} color={tagColor} size="sm" />}
          </div>
        </div>
      </div>
    </div>
  );
};
