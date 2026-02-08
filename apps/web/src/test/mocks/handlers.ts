// apps/web/src/test/mocks/handlers.ts
import { http, HttpResponse } from 'msw';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Default MSW handlers for all API endpoints
 * These prevent real HTTP requests during tests
 */
export const handlers = [
  // Auth endpoints
  http.get(`${API_URL}/v1/auth/me`, () => {
    return HttpResponse.json({ success: true, data: null });
  }),

  http.post(`${API_URL}/v1/auth/refresh`, () => {
    return HttpResponse.json({ success: false }, { status: 401 });
  }),

  // Geocoding endpoints
  http.post(`${API_URL}/v1/geocode`, () => {
    return HttpResponse.json({
      success: true,
      data: { lat: 40.7128, lng: -74.006, formattedAddress: 'New York, NY' },
    });
  }),

  http.post(`${API_URL}/v1/geocode/reverse`, () => {
    return HttpResponse.json({
      success: true,
      data: { address: '123 Test St', formattedAddress: '123 Test St, City' },
    });
  }),

  // Spots endpoints
  http.get(`${API_URL}/v1/spots`, () => {
    return HttpResponse.json({ success: true, data: { spots: [], total: 0 } });
  }),

  http.get(`${API_URL}/v1/spots/latest`, () => {
    return HttpResponse.json({ success: true, data: null });
  }),

  http.get(`${API_URL}/v1/spots/:id`, () => {
    return HttpResponse.json({ success: true, data: null });
  }),

  http.post(`${API_URL}/v1/spots`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        id: 'test-spot',
        lat: 40.7128,
        lng: -74.006,
        savedAt: new Date().toISOString(),
      },
    });
  }),

  http.patch(`${API_URL}/v1/spots/:id`, () => {
    return HttpResponse.json({ success: true, data: {} });
  }),

  http.delete(`${API_URL}/v1/spots/:id`, () => {
    return HttpResponse.json({ success: true });
  }),

  // Car tags endpoints
  http.get(`${API_URL}/v1/car-tags`, () => {
    return HttpResponse.json({
      success: true,
      data: [
        { id: 'tag-1', name: 'My Car', colorHex: '#3B82F6' },
        { id: 'tag-2', name: 'Rental', colorHex: '#10B981' },
      ],
    });
  }),

  // Share endpoints
  http.post(`${API_URL}/v1/share`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        token: 'test-token',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      },
    });
  }),

  http.get(`${API_URL}/v1/share/:token`, () => {
    return HttpResponse.json({ success: true, data: null });
  }),

  // Photo upload
  http.post(`${API_URL}/v1/photos/presign`, () => {
    return HttpResponse.json({
      success: true,
      data: {
        uploadUrl: 'https://example.com/upload',
        photoUrl: 'https://example.com/photo.jpg',
      },
    });
  }),

  // Catch-all for external APIs (like Nominatim)
  http.get('https://nominatim.openstreetmap.org/*', () => {
    return HttpResponse.json([]);
  }),
];
