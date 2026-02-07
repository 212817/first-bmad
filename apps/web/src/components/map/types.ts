// apps/web/src/components/map/types.ts

/**
 * Map tile layer configuration
 */
export interface TileLayerConfig {
  url: string;
  attribution: string;
  name: string;
  overlays?: string[]; // Optional overlay URLs for hybrid view (roads, labels)
}

/**
 * Available map view types
 */
export type MapViewType = 'street' | 'satellite' | 'hybrid';

/**
 * Props for SpotMap component
 */
export interface SpotMapProps {
  /** Latitude coordinate */
  lat: number;
  /** Longitude coordinate */
  lng: number;
  /** Whether the marker can be dragged to adjust position */
  editable?: boolean;
  /** Callback when marker position changes (accuracy=0 means manually set) */
  onPositionChange?: (lat: number, lng: number, accuracy: number) => void;
  /** Custom height class (default: h-48) */
  heightClass?: string;
  /** Test ID for testing */
  testId?: string;
}

/**
 * Props for LayerSwitcher component
 */
export interface LayerSwitcherProps {
  /** Current active layer */
  activeLayer: MapViewType;
  /** Callback when layer changes */
  onLayerChange: (layer: MapViewType) => void;
}

/**
 * Tile layer definitions for different map views
 */
export const TILE_LAYERS: Record<MapViewType, TileLayerConfig> = {
  street: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
    name: 'Street',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri',
    name: 'Satellite',
  },
  hybrid: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri, Labels &copy; CartoDB/OSM',
    name: 'Hybrid',
    overlays: [
      // CartoDB Voyager labels - most detailed OSM labels with POI
      'https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png',
    ],
  },
};

/**
 * LocalStorage key for map layer preference
 */
export const MAP_LAYER_STORAGE_KEY = 'wdip-map-layer';

/**
 * Default map zoom level for parking spots
 */
export const DEFAULT_ZOOM = 17;
