// apps/web/src/components/spot/SpotPhoto.tsx
import { useState } from 'react';

/**
 * Props for SpotPhoto component
 */
interface SpotPhotoProps {
  url: string;
  alt?: string;
  isZoomed?: boolean;
  onTap?: () => void;
  /** When true, use square aspect ratio instead of fixed height */
  isSquare?: boolean;
  /** Custom class name to override styles */
  className?: string;
}

/**
 * Full-width photo component with tap-to-zoom functionality
 * Used on the spot detail page to display the spot photo
 */
export const SpotPhoto = ({
  url,
  alt = 'Parking spot photo',
  isZoomed = false,
  onTap,
  isSquare = false,
  className = '',
}: SpotPhotoProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setIsLoading(false);
    setHasError(true);
  };

  const handleClick = () => {
    onTap?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onTap?.();
    }
  };

  // Error state - show placeholder
  if (hasError) {
    return (
      <div
        className={`w-full ${isSquare ? 'aspect-square' : 'h-64'} bg-gray-200 flex items-center justify-center ${className}`}
        data-testid="spot-photo-error"
      >
        <div className="text-center text-gray-500">
          <span className="text-4xl block mb-2" aria-hidden="true">
            📷
          </span>
          <span className="text-sm">Photo unavailable</span>
        </div>
      </div>
    );
  }

  // Zoomed overlay view
  if (isZoomed) {
    return (
      <div
        className="fixed inset-0 z-50 bg-black flex items-center justify-center"
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        role="button"
        tabIndex={0}
        aria-label="Close zoomed photo"
        data-testid="spot-photo-zoomed"
      >
        {/* Close hint */}
        <div className="absolute top-4 right-4 text-white/70 text-sm">
          Tap to close
        </div>
        <img
          src={url}
          alt={alt}
          className="max-w-full max-h-full object-contain"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative w-full ${isSquare ? 'aspect-square' : 'h-64'} overflow-hidden cursor-pointer ${className}`}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      role="button"
      tabIndex={0}
      aria-label="Tap to zoom photo"
      data-testid="spot-photo"
    >
      {/* Loading placeholder */}
      {isLoading && (
        <div
          className="absolute inset-0 bg-gray-200 flex items-center justify-center animate-pulse"
          data-testid="spot-photo-loading"
        >
          <span className="text-4xl" aria-hidden="true">
            📷
          </span>
        </div>
      )}

      {/* Photo */}
      <img
        src={url}
        alt={alt}
        className={`w-full h-full object-cover transition-opacity duration-200 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={handleLoad}
        onError={handleError}
      />

      {/* Zoom hint */}
      {!isLoading && (
        <div className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
          Tap to zoom
        </div>
      )}
    </div>
  );
};
