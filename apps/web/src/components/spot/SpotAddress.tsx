// apps/web/src/components/spot/SpotAddress.tsx
import { useState } from 'react';
import type { SpotAddressProps } from './types';

/**
 * Format coordinates to human-readable string
 * e.g., "40.7128°N, 74.0060°W"
 */
const formatCoordinates = (lat: number, lng: number): string => {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`;
};

/**
 * Component for displaying spot address with coordinate fallback
 *
 * Priority:
 * 1. Address (if available) - displayed as "Near [address]"
 * 2. Coordinates (if available) - displayed as formatted coordinates
 * 3. "Location not available" (if neither)
 */
export const SpotAddress = ({ lat, lng, address, isLoading = false }: SpotAddressProps) => {
  const [copiedAddress, setCopiedAddress] = useState(false);
  const [copiedCoords, setCopiedCoords] = useState(false);

  const handleCopyAddress = () => {
    if (!address) return;
    navigator.clipboard.writeText(address);
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    setCopiedAddress(true);
    setTimeout(() => setCopiedAddress(false), 1500);
  };

  const handleCopyCoordinates = () => {
    if (lat === null || lng === null) return;
    const coords = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
    navigator.clipboard.writeText(coords);
    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 1500);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center gap-2" data-testid="spot-address-loading">
        <span className="text-gray-400" aria-hidden="true">
          📍
        </span>
        <div className="animate-pulse bg-gray-200 h-5 w-32 rounded" />
      </div>
    );
  }

  // Address available - show prominently
  if (address) {
    return (
      <div className="flex flex-col gap-1" data-testid="spot-address">
        <div className="flex items-start gap-2">
          <span className="text-gray-400" aria-hidden="true">
            📍
          </span>
          <button
            type="button"
            onClick={handleCopyAddress}
            className="relative text-base font-medium text-gray-900 text-left hover:text-indigo-600 transition-colors"
            title="Tap to copy address"
          >
            <span className={copiedAddress ? 'invisible' : ''}>Near {address}</span>
            {copiedAddress && (
              <span className="absolute inset-0 flex items-center text-green-600 text-base font-medium">
                Copied
              </span>
            )}
          </button>
        </div>
        {/* Show coordinates as secondary info */}
        {lat !== null && lng !== null && (
          <button
            type="button"
            onClick={handleCopyCoordinates}
            className="relative text-sm text-gray-500 ml-7 font-mono text-left hover:text-indigo-600 transition-colors flex items-center gap-1"
            data-testid="spot-coordinates-secondary"
            title="Tap to copy coordinates"
          >
            <span className={copiedCoords ? 'invisible' : ''}>{formatCoordinates(lat, lng)}</span>
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
      </div>
    );
  }

  // Coordinates only - show as primary
  if (lat !== null && lng !== null) {
    return (
      <div className="flex items-start gap-2" data-testid="spot-coordinates-primary">
        <span className="text-gray-400" aria-hidden="true">
          📍
        </span>
        <button
          type="button"
          onClick={handleCopyCoordinates}
          className="relative text-sm font-mono text-gray-700 text-left hover:text-indigo-600 transition-colors flex items-center gap-1"
          title="Tap to copy coordinates"
        >
          <span className={copiedCoords ? 'invisible' : ''}>{formatCoordinates(lat, lng)}</span>
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
      </div>
    );
  }

  // Neither available
  return (
    <div className="flex items-start gap-2" data-testid="spot-address-unavailable">
      <span className="text-gray-400" aria-hidden="true">
        📍
      </span>
      <p className="text-sm text-gray-400 italic">Location not available</p>
    </div>
  );
};
