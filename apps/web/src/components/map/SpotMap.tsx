// apps/web/src/components/map/SpotMap.tsx
import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Circle, useMap } from 'react-leaflet';
import L from 'leaflet';

import { LayerSwitcher } from './LayerSwitcher';
import type { SpotMapProps, MapViewType } from './types';
import { TILE_LAYERS, MAP_LAYER_STORAGE_KEY, DEFAULT_ZOOM } from './types';

// Custom SVG marker icon - outline style with blue-to-cyan gradient (matching Flaticon design)
const customMarkerSvg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 84" width="64" height="84">
  <defs>
    <linearGradient id="pinGradient" x1="0%" y1="100%" x2="0%" y2="0%">
      <stop offset="0%" stop-color="#0066FF"/>
      <stop offset="100%" stop-color="#00D4FF"/>
    </linearGradient>
    <filter id="shadow" x="-20%" y="-10%" width="140%" height="130%">
      <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#000" flood-opacity="0.25"/>
    </filter>
  </defs>
  <path d="M32 4C17.64 4 6 15.64 6 30c0 6.5 2.2 12.5 6 17.3L32 78l20-30.7c3.8-4.8 6-10.8 6-17.3C58 15.64 46.36 4 32 4z" 
        fill="none" stroke="url(#pinGradient)" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" filter="url(#shadow)"/>
  <circle cx="32" cy="30" r="11" fill="none" stroke="url(#pinGradient)" stroke-width="4"/>
</svg>`;

const customMarkerUrl = `data:image/svg+xml;base64,${btoa(customMarkerSvg)}`;

// Configure custom icon for all markers - smaller size
const customIcon = L.icon({
  iconUrl: customMarkerUrl,
  iconSize: [28, 36],
  iconAnchor: [14, 36],
  popupAnchor: [0, -36],
});

L.Marker.prototype.options.icon = customIcon;

/**
 * Component to update map center when coordinates change (only for external prop changes)
 */
const MapUpdater = ({
  center,
  onCenterChange,
  editable,
}: {
  center: [number, number];
  onCenterChange?: (lat: number, lng: number) => void;
  editable?: boolean;
}) => {
  const map = useMap();
  const isUserDragging = useRef(false);
  const lastPropsCenter = useRef(center);

  // Update map view only when external props change (not during user drag)
  useEffect(() => {
    // Check if the center prop actually changed (not just a re-render)
    const propsChanged =
      lastPropsCenter.current[0] !== center[0] || lastPropsCenter.current[1] !== center[1];

    if (propsChanged && !isUserDragging.current) {
      map.setView(center, map.getZoom());
      lastPropsCenter.current = center;
    }
  }, [map, center]);

  // Track map movement when editable
  useEffect(() => {
    if (!editable || !onCenterChange) return;

    const handleMoveStart = () => {
      isUserDragging.current = true;
    };

    const handleMoveEnd = () => {
      const mapCenter = map.getCenter();
      onCenterChange(mapCenter.lat, mapCenter.lng);
      // Keep dragging flag true to prevent snap-back on re-render
      // It will be reset when props change externally
    };

    map.on('movestart', handleMoveStart);
    map.on('moveend', handleMoveEnd);
    return () => {
      map.off('movestart', handleMoveStart);
      map.off('moveend', handleMoveEnd);
    };
  }, [map, editable, onCenterChange]);

  return null;
};

/**
 * Locate me button component - gets user's current location
 */
const LocateControl = ({
  onLocate,
}: {
  onLocate: (lat: number, lng: number, accuracy: number) => void;
}) => {
  const map = useMap();
  const [isLocating, setIsLocating] = useState(false);

  const handleLocate = () => {
    if (!navigator.geolocation) return;

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude, accuracy } = position.coords;
        map.setView([latitude, longitude], DEFAULT_ZOOM);
        onLocate(latitude, longitude, accuracy);
        setIsLocating(false);
      },
      () => {
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  return (
    <button
      onClick={handleLocate}
      disabled={isLocating}
      className="absolute bottom-16 right-2 z-[400] w-10 h-10 bg-white rounded-lg shadow-md flex items-center justify-center hover:bg-gray-50 disabled:opacity-50"
      data-testid="map-locate-button"
      aria-label="Find my location"
    >
      {isLocating ? (
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600" />
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-5 h-5 text-gray-700"
        >
          <polygon points="3 11 22 2 13 21 11 13 3 11" />
        </svg>
      )}
    </button>
  );
};

/**
 * Get initial layer preference from localStorage
 */
const getInitialLayer = (): MapViewType => {
  if (typeof window === 'undefined') return 'hybrid';
  const stored = localStorage.getItem(MAP_LAYER_STORAGE_KEY);
  if (stored && (stored === 'street' || stored === 'satellite' || stored === 'hybrid')) {
    return stored;
  }
  return 'hybrid';
};

/**
 * Interactive map component for displaying and adjusting parking spot location
 * When editable, the marker stays centered and user pans the map to adjust position
 */
export const SpotMap = ({
  lat,
  lng,
  editable = false,
  onPositionChange,
  heightClass = 'h-48',
  testId = 'spot-map',
  accuracy = null,
  isRefining = false,
}: SpotMapProps) => {
  // Track adjusted position only when user pans the map
  const [adjustedPosition, setAdjustedPosition] = useState<[number, number] | null>(null);
  const [activeLayer, setActiveLayer] = useState<MapViewType>(getInitialLayer);
  const [isLoading, setIsLoading] = useState(true);

  // Original position from props
  const originalPosition: [number, number] = [lat, lng];
  // Current display position (adjusted or original)
  const displayPosition: [number, number] = adjustedPosition ?? originalPosition;
  const isDirty = adjustedPosition !== null;

  // Reset adjusted position when props change (new spot loaded)
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- Sync external prop changes
    setAdjustedPosition(null);
  }, [lat, lng]);

  const handleLayerChange = (layer: MapViewType) => {
    setActiveLayer(layer);
    localStorage.setItem(MAP_LAYER_STORAGE_KEY, layer);
  };

  // Handle map center change when user pans
  const handleCenterChange = (newLat: number, newLng: number) => {
    // Only mark as dirty if position actually changed
    if (Math.abs(newLat - lat) > 0.000001 || Math.abs(newLng - lng) > 0.000001) {
      setAdjustedPosition([newLat, newLng]);
    }
  };

  const handleConfirm = () => {
    if (adjustedPosition) {
      // Pass accuracy=0 to indicate manually set position
      onPositionChange?.(adjustedPosition[0], adjustedPosition[1], 0);
    }
    setAdjustedPosition(null);
  };

  const handleCancel = () => {
    setAdjustedPosition(null);
  };

  const handleTileLoad = () => {
    setIsLoading(false);
  };

  const tileConfig = TILE_LAYERS[activeLayer];

  return (
    <div className={`relative ${heightClass} rounded-lg overflow-hidden`} data-testid={testId}>
      {/* Loading overlay */}
      {isLoading && (
        <div
          className="absolute inset-0 bg-gray-200 flex items-center justify-center z-[400]"
          data-testid="map-loading"
        >
          <div className="flex flex-col items-center gap-2 text-gray-500">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
            <span className="text-sm">Loading map...</span>
          </div>
        </div>
      )}

      <MapContainer
        center={originalPosition}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={false}
        className="h-full w-full z-0"
        zoomControl={true}
      >
        <MapUpdater
          center={originalPosition}
          onCenterChange={handleCenterChange}
          editable={editable}
        />

        {/* Base tile layer */}
        <TileLayer
          key={`base-${activeLayer}`}
          url={tileConfig.url}
          attribution={tileConfig.attribution}
          eventHandlers={{
            load: handleTileLoad,
          }}
        />

        {/* Overlays for hybrid view (roads + labels on satellite) */}
        {tileConfig.overlays?.map((overlayUrl, index) => (
          <TileLayer
            key={`overlay-${activeLayer}-${index}`}
            url={overlayUrl}
            attribution=""
            pane="overlayPane"
          />
        ))}

        {/* Marker only shown in non-editable mode - low z-index to avoid overlapping UI */}
        {!editable && <Marker position={displayPosition} zIndexOffset={-1000} />}

        {/* Accuracy circle - light blue transparent circle */}
        {/* Hide when user has adjusted position (dragged map) */}
        {/* Use shadowPane to avoid invert filter on overlayPane */}
        {accuracy && accuracy > 50 && !adjustedPosition && (
          <Circle
            center={displayPosition}
            radius={accuracy}
            pane="shadowPane"
            pathOptions={{
              color: '#4285F4',
              weight: 2,
              fillColor: '#4285F4',
              fillOpacity: 0.15,
            }}
          />
        )}

        {/* Locate me button - only show when editable (must be inside MapContainer for useMap) */}
        {editable && (
          <LocateControl
            onLocate={(lat, lng, acc) => {
              // Reset adjusted position and pass GPS location with accuracy
              setAdjustedPosition(null);
              onPositionChange?.(lat, lng, acc);
            }}
          />
        )}
      </MapContainer>

      {/* Layer switcher */}
      <LayerSwitcher activeLayer={activeLayer} onLayerChange={handleLayerChange} />

      {/* Centered marker pin overlay - shown when editable */}
      {editable && (
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-full z-[500] pointer-events-none"
          data-testid="map-center-marker"
        >
          <svg width="28" height="36" viewBox="0 0 50 65" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="editPinGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor="#00D4FF" />
                <stop offset="100%" stopColor="#0066FF" />
              </linearGradient>
            </defs>
            <path
              d="M25 1C11.745 1 1 11.745 1 25c0 11.255 24 39 24 39s24-27.745 24-39C49 11.745 38.255 1 25 1z"
              fill="none"
              stroke="url(#editPinGradient)"
              strokeWidth="3"
            />
            <circle
              cx="25"
              cy="25"
              r="10"
              fill="none"
              stroke="url(#editPinGradient)"
              strokeWidth="3"
            />
          </svg>
        </div>
      )}

      {/* Confirm/Cancel buttons when marker moved */}
      {isDirty && editable && (
        <div
          className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-[400]"
          data-testid="map-confirm-controls"
        >
          <button
            onClick={handleCancel}
            className="px-3 py-2 bg-white text-gray-700 rounded-lg shadow-md text-sm font-medium hover:bg-gray-50"
            data-testid="map-cancel-button"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md text-sm font-medium hover:bg-indigo-700"
            data-testid="map-confirm-button"
          >
            Confirm Location
          </button>
        </div>
      )}

      {/* Drag hint when editable */}
      {editable && !isDirty && (
        <div
          className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 text-white text-xs rounded-full z-[400]"
          data-testid="map-drag-hint"
        >
          Drag map to adjust location
        </div>
      )}
    </div>
  );
};
