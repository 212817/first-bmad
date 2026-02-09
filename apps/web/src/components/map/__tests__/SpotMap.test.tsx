// apps/web/src/components/map/__tests__/SpotMap.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

import { SpotMap } from '../SpotMap';
import { MAP_LAYER_STORAGE_KEY } from '../types';

// Mock react-leaflet
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children, className }: { children: React.ReactNode; className: string }) => (
    <div data-testid="map-container" className={className}>
      {children}
    </div>
  ),
  TileLayer: ({ url, eventHandlers }: { url: string; eventHandlers?: { load?: () => void } }) => {
    // Simulate tile load after a short delay
    if (eventHandlers?.load) {
      setTimeout(eventHandlers.load, 10);
    }
    return <div data-testid="tile-layer" data-url={url} />;
  },
  Marker: ({ position }: { position: [number, number] }) => (
    <div data-testid="map-marker" data-lat={position[0]} data-lng={position[1]} />
  ),
  Circle: ({ center, radius }: { center: [number, number]; radius: number }) => (
    <div data-testid="accuracy-circle" data-lat={center[0]} data-lng={center[1]} data-radius={radius} />
  ),
  useMap: () => ({
    setView: vi.fn(),
    getZoom: () => 17,
    getCenter: () => ({ lat: 48.9102, lng: 24.7085 }),
    on: vi.fn(),
    off: vi.fn(),
  }),
}));

// Mock leaflet
vi.mock('leaflet', () => ({
  default: {
    icon: vi.fn(() => ({})),
    Marker: {
      prototype: {
        options: {},
      },
    },
  },
}));

// Mock leaflet images
vi.mock('leaflet/dist/images/marker-icon-2x.png', () => ({ default: 'marker-icon-2x.png' }));
vi.mock('leaflet/dist/images/marker-icon.png', () => ({ default: 'marker-icon.png' }));
vi.mock('leaflet/dist/images/marker-shadow.png', () => ({ default: 'marker-shadow.png' }));

describe('SpotMap', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('renders map container with correct test id', () => {
      render(<SpotMap lat={48.9102} lng={24.7085} />);

      expect(screen.getByTestId('spot-map')).toBeInTheDocument();
    });

    it('renders map container with custom test id', () => {
      render(<SpotMap lat={48.9102} lng={24.7085} testId="custom-map" />);

      expect(screen.getByTestId('custom-map')).toBeInTheDocument();
    });

    it('renders marker at provided coordinates', () => {
      render(<SpotMap lat={48.9102} lng={24.7085} />);

      const marker = screen.getByTestId('map-marker');
      expect(marker).toHaveAttribute('data-lat', '48.9102');
      expect(marker).toHaveAttribute('data-lng', '24.7085');
    });

    it('renders tile layers (base + overlays for hybrid)', () => {
      render(<SpotMap lat={48.9102} lng={24.7085} />);

      // Hybrid mode (default) has multiple tile layers
      const tileLayers = screen.getAllByTestId('tile-layer');
      expect(tileLayers.length).toBeGreaterThanOrEqual(1);
    });

    it('shows loading state initially', () => {
      render(<SpotMap lat={48.9102} lng={24.7085} />);

      expect(screen.getByTestId('map-loading')).toBeInTheDocument();
    });

    it('hides loading state after tiles load', async () => {
      render(<SpotMap lat={48.9102} lng={24.7085} />);

      await waitFor(() => {
        expect(screen.queryByTestId('map-loading')).not.toBeInTheDocument();
      });
    });
  });

  describe('editable mode', () => {
    it('shows marker in non-editable mode', () => {
      render(<SpotMap lat={48.9102} lng={24.7085} />);

      expect(screen.getByTestId('map-marker')).toBeInTheDocument();
    });

    it('hides marker in editable mode (uses centered pin overlay)', () => {
      render(<SpotMap lat={48.9102} lng={24.7085} editable />);

      // Marker is not rendered in editable mode - we use centered pin overlay instead
      expect(screen.queryByTestId('map-marker')).not.toBeInTheDocument();
      expect(screen.getByTestId('map-center-marker')).toBeInTheDocument();
    });

    it('shows drag hint when editable', () => {
      render(<SpotMap lat={48.9102} lng={24.7085} editable />);

      expect(screen.getByTestId('map-drag-hint')).toBeInTheDocument();
      expect(screen.getByText('Drag map to adjust location')).toBeInTheDocument();
    });

    it('does not show drag hint when not editable', () => {
      render(<SpotMap lat={48.9102} lng={24.7085} />);

      expect(screen.queryByTestId('map-drag-hint')).not.toBeInTheDocument();
    });

    it('shows locate button when editable', () => {
      render(<SpotMap lat={48.9102} lng={24.7085} editable />);

      expect(screen.getByTestId('map-locate-button')).toBeInTheDocument();
    });

    it('does not show locate button when not editable', () => {
      render(<SpotMap lat={48.9102} lng={24.7085} />);

      expect(screen.queryByTestId('map-locate-button')).not.toBeInTheDocument();
    });
  });

  describe('layer switcher', () => {
    it('renders layer switcher', () => {
      render(<SpotMap lat={48.9102} lng={24.7085} />);

      expect(screen.getByTestId('layer-switcher')).toBeInTheDocument();
    });

    it('opens layer menu on click', () => {
      render(<SpotMap lat={48.9102} lng={24.7085} />);

      const button = screen.getByTestId('layer-switcher-button');
      fireEvent.click(button);

      expect(screen.getByTestId('layer-switcher-menu')).toBeInTheDocument();
    });

    it('shows all layer options in menu', () => {
      render(<SpotMap lat={48.9102} lng={24.7085} />);

      fireEvent.click(screen.getByTestId('layer-switcher-button'));

      expect(screen.getByTestId('layer-option-street')).toBeInTheDocument();
      expect(screen.getByTestId('layer-option-satellite')).toBeInTheDocument();
      expect(screen.getByTestId('layer-option-hybrid')).toBeInTheDocument();
    });

    it('closes menu after selecting layer', () => {
      render(<SpotMap lat={48.9102} lng={24.7085} />);

      fireEvent.click(screen.getByTestId('layer-switcher-button'));
      fireEvent.click(screen.getByTestId('layer-option-satellite'));

      expect(screen.queryByTestId('layer-switcher-menu')).not.toBeInTheDocument();
    });

    it('persists layer preference to localStorage', () => {
      render(<SpotMap lat={48.9102} lng={24.7085} />);

      fireEvent.click(screen.getByTestId('layer-switcher-button'));
      fireEvent.click(screen.getByTestId('layer-option-satellite'));

      expect(localStorage.getItem(MAP_LAYER_STORAGE_KEY)).toBe('satellite');
    });

    it('loads saved layer preference from localStorage', () => {
      localStorage.setItem(MAP_LAYER_STORAGE_KEY, 'hybrid');

      render(<SpotMap lat={48.9102} lng={24.7085} />);

      // Open menu to check which option is selected
      fireEvent.click(screen.getByTestId('layer-switcher-button'));
      const hybridOption = screen.getByTestId('layer-option-hybrid');
      expect(hybridOption).toHaveClass('bg-indigo-50');
    });
  });

  describe('height customization', () => {
    it('uses default height class h-48', () => {
      render(<SpotMap lat={48.9102} lng={24.7085} />);

      const container = screen.getByTestId('spot-map');
      expect(container).toHaveClass('h-48');
    });

    it('uses custom height class when provided', () => {
      render(<SpotMap lat={48.9102} lng={24.7085} heightClass="h-64" />);

      const container = screen.getByTestId('spot-map');
      expect(container).toHaveClass('h-64');
    });
  });

  describe('coordinate updates', () => {
    it('updates marker position when props change', () => {
      const { rerender } = render(<SpotMap lat={48.9102} lng={24.7085} />);

      rerender(<SpotMap lat={49.0} lng={25.0} />);

      const marker = screen.getByTestId('map-marker');
      expect(marker).toHaveAttribute('data-lat', '49');
      expect(marker).toHaveAttribute('data-lng', '25');
    });
  });

  describe('accuracy circle', () => {
    it('does not show circle when accuracy is null', () => {
      render(<SpotMap lat={48.9102} lng={24.7085} accuracy={null} />);
      expect(screen.queryByTestId('accuracy-circle')).not.toBeInTheDocument();
    });

    it('does not show circle when accuracy is low (under 50m)', () => {
      render(<SpotMap lat={48.9102} lng={24.7085} accuracy={30} />);
      expect(screen.queryByTestId('accuracy-circle')).not.toBeInTheDocument();
    });

    it('shows circle when accuracy is above 50m', () => {
      render(<SpotMap lat={48.9102} lng={24.7085} accuracy={500} />);
      const circle = screen.getByTestId('accuracy-circle');
      expect(circle).toBeInTheDocument();
      expect(circle).toHaveAttribute('data-radius', '500');
    });

    it('shows circle at correct position', () => {
      render(<SpotMap lat={48.9102} lng={24.7085} accuracy={1000} />);
      const circle = screen.getByTestId('accuracy-circle');
      expect(circle).toHaveAttribute('data-lat', '48.9102');
      expect(circle).toHaveAttribute('data-lng', '24.7085');
    });
  });
});
