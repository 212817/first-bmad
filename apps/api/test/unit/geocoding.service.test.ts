// apps/api/test/unit/geocoding.service.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { geocodingService } from '../../src/services/geocoding/geocoding.service.js';
import { geocacheRepository } from '../../src/repositories/geocache.repository.js';
import type { OpenCageResponse } from '../../src/services/geocoding/types.js';

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock the geocache repository
vi.mock('../../src/repositories/geocache.repository.js', () => ({
  geocacheRepository: {
    findByAddress: vi.fn(),
    create: vi.fn(),
  },
}));

describe('geocodingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Suppress expected console output during tests
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
    // Default: no cache hit
    vi.mocked(geocacheRepository.findByAddress).mockResolvedValue(null);
    vi.mocked(geocacheRepository.create).mockResolvedValue({
      id: 'cache-123',
      addressQuery: '123 main st',
      lat: 40.7128,
      lng: -74.006,
      formattedAddress: '123 Main St, NY',
      createdAt: new Date(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('geocodeAddress', () => {
    it('should return coordinates for valid address', async () => {
      const mockResponse: OpenCageResponse = {
        results: [
          {
            geometry: { lat: 40.7128, lng: -74.006 },
            formatted: '123 Main St, New York, NY 10001, USA',
            confidence: 9,
          },
        ],
        status: { code: 200, message: 'OK' },
        rate: { limit: 2500, remaining: 2499, reset: 1700000000 },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await geocodingService.geocodeAddress('123 Main St, New York');

      expect(result).toEqual({
        lat: 40.7128,
        lng: -74.006,
        formattedAddress: '123 Main St, New York, NY 10001, USA',
      });
    });

    it('should return cached result when available', async () => {
      vi.mocked(geocacheRepository.findByAddress).mockResolvedValueOnce({
        id: 'cache-123',
        addressQuery: '123 main st, new york',
        lat: 40.7128,
        lng: -74.006,
        formattedAddress: '123 Main St, New York, NY (cached)',
        createdAt: new Date(),
      });

      const result = await geocodingService.geocodeAddress('123 Main St, New York');

      expect(result).toEqual({
        lat: 40.7128,
        lng: -74.006,
        formattedAddress: '123 Main St, New York, NY (cached)',
      });
      // Should not call OpenCage API
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should cache new results from API', async () => {
      const mockResponse: OpenCageResponse = {
        results: [
          {
            geometry: { lat: 40.7128, lng: -74.006 },
            formatted: '123 Main St, New York, NY',
            confidence: 9,
          },
        ],
        status: { code: 200, message: 'OK' },
        rate: { limit: 2500, remaining: 2499, reset: 1700000000 },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await geocodingService.geocodeAddress('123 Main St, New York');

      // Wait for async cache write
      await new Promise((resolve) => setTimeout(resolve, 10));

      expect(geocacheRepository.create).toHaveBeenCalledWith({
        addressQuery: '123 main st, new york',
        lat: 40.7128,
        lng: -74.006,
        formattedAddress: '123 Main St, New York, NY',
      });
    });

    it('should continue to API if cache lookup fails', async () => {
      vi.mocked(geocacheRepository.findByAddress).mockRejectedValueOnce(
        new Error('DB connection error')
      );

      const mockResponse: OpenCageResponse = {
        results: [
          {
            geometry: { lat: 40.7128, lng: -74.006 },
            formatted: '123 Main St, New York, NY',
            confidence: 9,
          },
        ],
        status: { code: 200, message: 'OK' },
        rate: { limit: 2500, remaining: 2499, reset: 1700000000 },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await geocodingService.geocodeAddress('123 Main St, New York');

      expect(result).not.toBeNull();
      expect(mockFetch).toHaveBeenCalled();
    });

    it('should normalize address to lowercase and trim', async () => {
      const mockResponse: OpenCageResponse = {
        results: [
          {
            geometry: { lat: 40.7128, lng: -74.006 },
            formatted: '123 Main St, New York, NY',
            confidence: 9,
          },
        ],
        status: { code: 200, message: 'OK' },
        rate: { limit: 2500, remaining: 2499, reset: 1700000000 },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await geocodingService.geocodeAddress('  123 MAIN ST  ');

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('q=123+main+st'),
        expect.any(Object)
      );
    });

    it('should return null for empty address', async () => {
      const result = await geocodingService.geocodeAddress('');

      expect(result).toBeNull();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should return null for address too short (< 5 chars)', async () => {
      const result = await geocodingService.geocodeAddress('Test');

      expect(result).toBeNull();
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it('should return null when no results found', async () => {
      const mockResponse: OpenCageResponse = {
        results: [],
        status: { code: 200, message: 'OK' },
        rate: { limit: 2500, remaining: 2499, reset: 1700000000 },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await geocodingService.geocodeAddress('zzznonexistent123xyz');

      expect(result).toBeNull();
    });

    it('should return null on rate limit (429)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 429,
      });

      const result = await geocodingService.geocodeAddress('123 Main St, New York');

      expect(result).toBeNull();
    });

    it('should return null on quota exceeded (402)', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 402,
      });

      const result = await geocodingService.geocodeAddress('123 Main St, New York');

      expect(result).toBeNull();
    });

    it('should return null on API error', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
      });

      const result = await geocodingService.geocodeAddress('123 Main St, New York');

      expect(result).toBeNull();
    });

    it('should return null on network error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const result = await geocodingService.geocodeAddress('123 Main St, New York');

      expect(result).toBeNull();
    });

    it('should handle formattedAddress being undefined', async () => {
      const mockResponse: OpenCageResponse = {
        results: [
          {
            geometry: { lat: 40.7128, lng: -74.006 },
            formatted: '',
            confidence: 5,
          },
        ],
        status: { code: 200, message: 'OK' },
        rate: { limit: 2500, remaining: 2499, reset: 1700000000 },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      const result = await geocodingService.geocodeAddress('123 Main St');

      expect(result).toEqual({
        lat: 40.7128,
        lng: -74.006,
        formattedAddress: null,
      });
    });

    it('should call OpenCage API with correct parameters', async () => {
      const mockResponse: OpenCageResponse = {
        results: [
          {
            geometry: { lat: 40.7128, lng: -74.006 },
            formatted: '123 Main St, New York, NY',
            confidence: 9,
          },
        ],
        status: { code: 200, message: 'OK' },
        rate: { limit: 2500, remaining: 2499, reset: 1700000000 },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockResponse),
      });

      await geocodingService.geocodeAddress('123 Main St, New York');

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url] = mockFetch.mock.calls[0] as [string, unknown];
      expect(url).toContain('api.opencagedata.com');
      expect(url).toContain('limit=1');
      expect(url).toContain('no_annotations=1');
    });
  });
});
