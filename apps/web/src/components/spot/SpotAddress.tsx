// apps/web/src/components/spot/SpotAddress.tsx
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
          <p className="text-base font-medium text-gray-900">Near {address}</p>
        </div>
        {/* Show coordinates as secondary info */}
        {lat !== null && lng !== null && (
          <p
            className="text-xs text-gray-500 ml-7 font-mono"
            data-testid="spot-coordinates-secondary"
          >
            {formatCoordinates(lat, lng)}
          </p>
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
        <div>
          <p className="text-sm font-mono text-gray-700">{formatCoordinates(lat, lng)}</p>
        </div>
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
