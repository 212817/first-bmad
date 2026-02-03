// apps/web/src/components/spot/SpotThumbnail.tsx
import { useState } from 'react';
import type { SpotThumbnailProps } from './types';

/**
 * Photo thumbnail component for spot display
 * Loads photo from URL with loading and error states
 */
export const SpotThumbnail = ({
  url,
  alt = 'Parking spot photo',
  className = '',
}: SpotThumbnailProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  // Error state - show placeholder
  if (hasError) {
    return (
      <div
        className={`bg-gray-100 flex items-center justify-center ${className}`}
        data-testid="spot-thumbnail-error"
        aria-label="Photo unavailable"
      >
        <span className="text-gray-400 text-xl" aria-hidden="true">
          📷
        </span>
      </div>
    );
  }

  return (
    <div className={`relative overflow-hidden ${className}`} data-testid="spot-thumbnail">
      {/* Loading placeholder */}
      {isLoading && (
        <div
          className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center"
          data-testid="spot-thumbnail-loading"
        >
          <span className="text-gray-400 text-xl" aria-hidden="true">
            📷
          </span>
        </div>
      )}
      {/* Actual image */}
      <img
        src={url}
        alt={alt}
        className={`w-full h-full object-cover ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        onLoad={handleLoad}
        onError={handleError}
        loading="lazy"
      />
    </div>
  );
};
