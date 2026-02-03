// apps/web/src/components/spot/LocationCard.tsx
import { useState } from 'react';
import { formatCoordinates } from '@/utils/formatters';

/**
 * Props for LocationCard component
 */
interface LocationCardProps {
  address: string | null;
  lat: number | null;
  lng: number | null;
}

/**
 * Card component displaying location information
 * Copies address or coordinates to clipboard on tap
 */
export const LocationCard = ({ address, lat, lng }: LocationCardProps) => {
  const [copied, setCopied] = useState(false);

  /**
   * Copy location to clipboard
   */
  const copyToClipboard = async () => {
    const text =
      address ||
      (lat !== null && lng !== null
        ? `${lat.toFixed(6)}, ${lng.toFixed(6)}`
        : 'Location not available');

    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API may not be available
      console.error('Failed to copy to clipboard');
    }
  };

  const hasCoordinates = lat !== null && lng !== null;
  const coordinatesDisplay = hasCoordinates ? formatCoordinates(lat, lng) : null;

  return (
    <button
      onClick={copyToClipboard}
      className="w-full text-left bg-white p-4 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
      data-testid="location-card"
      aria-label={`Copy ${address || 'coordinates'} to clipboard`}
    >
      <div className="flex items-start gap-3">
        <span className="text-xl shrink-0 mt-0.5" aria-hidden="true">
          📍
        </span>
        <div className="flex-1 min-w-0">
          {address ? (
            <>
              <p className="font-medium text-gray-900" data-testid="location-address">
                {address}
              </p>
              {hasCoordinates && (
                <p className="text-sm text-gray-500 mt-0.5" data-testid="location-coordinates">
                  {coordinatesDisplay}
                </p>
              )}
            </>
          ) : hasCoordinates ? (
            <p className="font-medium text-gray-900" data-testid="location-coordinates-only">
              {lat!.toFixed(6)}, {lng!.toFixed(6)}
            </p>
          ) : (
            <p className="font-medium text-gray-500" data-testid="location-unavailable">
              Location not available
            </p>
          )}
          <p
            className={`text-xs mt-1 transition-colors ${
              copied ? 'text-green-600' : 'text-gray-400'
            }`}
            data-testid="copy-hint"
          >
            {copied ? 'Copied!' : 'Tap to copy'}
          </p>
        </div>
      </div>
    </button>
  );
};
