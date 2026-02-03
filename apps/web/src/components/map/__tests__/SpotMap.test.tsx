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
  Marker: ({
    position,
    draggable,
    eventHandlers,
  }: {
    position: [number, number];
    draggable: boolean;
    eventHandlers?: { dragend?: () => void };
  }) => (
    <div
      data-testid="map-marker"
      data-lat={position[0]}
      data-lng={position[1]}
      data-draggable={draggable}
      onClick={() => {
        // Simulate drag end for testing
        if (eventHandlers?.dragend) {
          eventHandlers.dragend();
        }
      }}
    />
  ),
  useMap: () => ({
    setView: vi.fn(),
    getZoom: () => 17,
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

    it('renders tile layer', () => {
      render(<SpotMap lat={48.9102} lng={24.7085} />);

      expect(screen.getByTestId('tile-layer')).toBeInTheDocument();
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
    it('renders non-draggable marker by default', () => {
      render(<SpotMap lat={48.9102} lng={24.7085} />);

      const marker = screen.getByTestId('map-marker');
      expect(marker).toHaveAttribute('data-draggable', 'false');
    });

    it('renders draggable marker when editable', () => {
      render(<SpotMap lat={48.9102} lng={24.7085} editable />);

      const marker = screen.getByTestId('map-marker');
      expect(marker).toHaveAttribute('data-draggable', 'true');
    });

    it('shows drag hint when editable', () => {
      render(<SpotMap lat={48.9102} lng={24.7085} editable />);

      expect(screen.getByTestId('map-drag-hint')).toBeInTheDocument();
      expect(screen.getByText('Drag marker to adjust')).toBeInTheDocument();
    });

    it('does not show drag hint when not editable', () => {
      render(<SpotMap lat={48.9102} lng={24.7085} />);

      expect(screen.queryByTestId('map-drag-hint')).not.toBeInTheDocument();
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
});
