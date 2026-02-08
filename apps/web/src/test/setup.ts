import '@testing-library/jest-dom/vitest';
import { vi, beforeAll, afterEach, afterAll } from 'vitest';
import { server } from './mocks/server';

// ============================================================================
// MSW Server Setup - Mock all HTTP requests in tests
// ============================================================================
beforeAll(() => server.listen({ onUnhandledRequest: 'bypass' }));
afterEach(() => server.resetHandlers());
afterAll(() => server.close());

// ============================================================================
// GLOBAL MOCKS - Leaflet/Map components crash jsdom, must be mocked globally
// ============================================================================

// Mock leaflet - the library itself tries to access browser APIs on import
vi.mock('leaflet', () => ({
  default: {
    icon: vi.fn(() => ({})),
    Marker: { prototype: { options: {} } },
    map: vi.fn(),
  },
  icon: vi.fn(() => ({})),
  Marker: { prototype: { options: {} } },
  map: vi.fn(),
}));

// Mock react-leaflet - depends on leaflet
vi.mock('react-leaflet', () => ({
  MapContainer: () => null,
  TileLayer: () => null,
  Marker: () => null,
  useMap: () => ({
    setView: vi.fn(),
    getZoom: vi.fn(() => 17),
    getCenter: vi.fn(() => ({ lat: 0, lng: 0 })),
    on: vi.fn(),
    off: vi.fn(),
  }),
}));

// Mock our SpotMap component - uses leaflet internally
vi.mock('@/components/map', () => ({
  SpotMap: () => null,
}));

// ============================================================================
// Suppress jsdom 28 xhr errors (known issue with undici in jsdom)
// These errors occur during reverse geocoding but don't affect test results
// See: https://github.com/jsdom/jsdom/issues/3740
// ============================================================================
const originalConsoleError = console.error;
console.error = (...args: unknown[]) => {
  const message = String(args[0]);
  // Suppress jsdom xhr dispatcher errors
  if (
    message.includes('InvalidArgumentError') ||
    message.includes('invalid onError method') ||
    message.includes('UND_ERR_INVALID_ARG')
  ) {
    return;
  }
  originalConsoleError.apply(console, args);
};
