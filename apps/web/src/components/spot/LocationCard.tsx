// apps/web/src/components/spot/LocationCard.tsx
import { useState } from 'react';
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
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);

  const handleCopyCoordinates = () => {
    if (!hasCoordinates) return;
    const coords = `${lat!.toFixed(6)}, ${lng!.toFixed(6)}`;
    navigator.clipboard.writeText(coords);
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 1500);
  };

  const handleCopyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 1500);
  };

  return (
    <div className="bg-white p-4 rounded-lg border border-gray-200" data-testid="location-card">
      <div className="flex items-start gap-3">
        <span className="text-gray-400 shrink-0" aria-hidden="true">
          📍
        </span>
        <div className="flex-1 min-w-0 text-left">
          {/* Address or unavailable */}
          <button
            type="button"
            onClick={handleCopyAddress}
            disabled={!address}
            className="relative text-sm font-medium text-gray-800 text-left hover:text-indigo-600 transition-colors disabled:hover:text-gray-800 disabled:cursor-default w-full"
            data-testid="location-address"
            title={address ? 'Tap to copy address' : undefined}
          >
            <span className={copiedAddress ? 'invisible' : ''}>
              {address ?? 'Address unavailable'}
            </span>
            {copiedAddress && (
              <span className="absolute inset-0 flex items-center text-green-600 text-sm font-medium bg-white">
                Copied
              </span>
            )}
          </button>
          {/* Coordinates and Tag row */}
          <div className="flex items-center justify-between mt-0.5">
            {/* Coordinates - always show with copy button */}
            {hasCoordinates && (
              <button
                type="button"
                onClick={handleCopyCoordinates}
                className="relative text-sm text-gray-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                title="Tap to copy coordinates"
                data-testid="location-coordinates"
              >
                <span className={copiedCoords ? 'invisible' : ''}>
                  {lat!.toFixed(4)}°N, {lng!.toFixed(4)}°E
                </span>
                {copiedCoords ? (
                  <span className="absolute inset-0 flex items-center text-green-600 text-sm font-medium">
                    Copied
                  </span>
                ) : (
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                    />
                  </svg>
                )}
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
