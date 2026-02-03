// apps/web/src/components/map/SpotMap.tsx
import { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';

import { LayerSwitcher } from './LayerSwitcher';
import type { SpotMapProps, MapViewType } from './types';
import { TILE_LAYERS, MAP_LAYER_STORAGE_KEY, DEFAULT_ZOOM } from './types';

// Fix Leaflet default marker icon issue in bundlers
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Configure default icon
const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

L.Marker.prototype.options.icon = defaultIcon;

/**
 * Component to update map center when coordinates change
 */
const MapUpdater = ({ center }: { center: [number, number] }) => {
  const map = useMap();

  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [map, center]);

  return null;
};

/**
 * Get initial layer preference from localStorage
 */
const getInitialLayer = (): MapViewType => {
  if (typeof window === 'undefined') return 'street';
  const stored = localStorage.getItem(MAP_LAYER_STORAGE_KEY);
  if (stored && (stored === 'street' || stored === 'satellite' || stored === 'hybrid')) {
    return stored;
  }
  return 'street';
};

/**
 * Interactive map component for displaying and adjusting parking spot location
 */
export const SpotMap = ({
  lat,
  lng,
  editable = false,
  onPositionChange,
  heightClass = 'h-48',
  testId = 'spot-map',
}: SpotMapProps) => {
  // Track adjusted position only when user drags marker
  const [adjustedPosition, setAdjustedPosition] = useState<[number, number] | null>(null);
  const [activeLayer, setActiveLayer] = useState<MapViewType>(getInitialLayer);
  const [isLoading, setIsLoading] = useState(true);
  const markerRef = useRef<L.Marker>(null);

  // Current position: use adjusted position if set, otherwise props
  const position: [number, number] = adjustedPosition ?? [lat, lng];
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

  const handleDragEnd = () => {
    const marker = markerRef.current;
    if (marker) {
      const pos = marker.getLatLng();
      setAdjustedPosition([pos.lat, pos.lng]);
    }
  };

  const handleConfirm = () => {
    if (adjustedPosition) {
      onPositionChange?.(adjustedPosition[0], adjustedPosition[1]);
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
        center={position}
        zoom={DEFAULT_ZOOM}
        scrollWheelZoom={false}
        className="h-full w-full z-0"
        zoomControl={true}
      >
        <MapUpdater center={position} />

        {/* Base tile layer */}
        <TileLayer
          key={`base-${activeLayer}`}
          url={tileConfig.url}
          attribution={tileConfig.attribution}
          eventHandlers={{
            load: handleTileLoad,
          }}
        />

        {/* Overlay for hybrid view (labels on satellite) */}
        {tileConfig.overlay && (
          <TileLayer key={`overlay-${activeLayer}`} url={tileConfig.overlay} attribution="" />
        )}

        <Marker
          ref={markerRef}
          position={position}
          draggable={editable}
          eventHandlers={{
            dragend: handleDragEnd,
          }}
        />
      </MapContainer>

      {/* Layer switcher */}
      <LayerSwitcher activeLayer={activeLayer} onLayerChange={handleLayerChange} />

      {/* Confirm/Cancel buttons when marker moved */}
      {isDirty && editable && (
        <div
          className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2 z-[1000]"
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
          className="absolute bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/60 text-white text-xs rounded-full z-[1000]"
          data-testid="map-drag-hint"
        >
          Drag marker to adjust
        </div>
      )}
    </div>
  );
};
