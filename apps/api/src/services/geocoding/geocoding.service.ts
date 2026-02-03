// apps/api/src/services/geocoding/geocoding.service.ts
import { env } from '../../config/env.js';
import { geocacheRepository } from '../../repositories/geocache.repository.js';
import type { GeocodingResult, GeocodingServiceInterface, OpenCageResponse } from './types.js';

/** OpenCage API base URL */
const OPENCAGE_URL = 'https://api.opencagedata.com/geocode/v1/json';

/** Request timeout in milliseconds */
const REQUEST_TIMEOUT = 10000;

/**
 * Geocoding service for converting addresses to coordinates
 * Uses OpenCage API for forward geocoding with database caching
 */
export const geocodingService: GeocodingServiceInterface = {
  /**
   * Geocode an address string to coordinates
   * Checks cache first, then calls OpenCage API
   */
  geocodeAddress: async (address: string): Promise<GeocodingResult | null> => {
    const normalizedAddress = address.toLowerCase().trim();

    if (!normalizedAddress || normalizedAddress.length < 5) {
      return null;
    }

    // Check cache first
    try {
      const cached = await geocacheRepository.findByAddress(normalizedAddress);
      if (cached) {
        return {
          lat: cached.lat,
          lng: cached.lng,
          formattedAddress: cached.formattedAddress,
        };
      }
    } catch (error) {
      // Log cache error but continue to API
      console.warn('[Geocoding] Cache lookup failed:', error);
    }

    // Call OpenCage API
    const url = new URL(OPENCAGE_URL);
    url.searchParams.set('q', normalizedAddress);
    url.searchParams.set('key', env.OPENCAGE_API_KEY);
    url.searchParams.set('limit', '1');
    url.searchParams.set('no_annotations', '1');

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT);

    try {
      const response = await fetch(url.toString(), {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        // Rate limit exceeded
        if (response.status === 429) {
          console.warn('[Geocoding] Rate limit exceeded');
          return null;
        }
        // Payment required (quota exceeded)
        if (response.status === 402) {
          console.error('[Geocoding] API quota exceeded');
          return null;
        }
        console.error(`[Geocoding] API error: ${response.status}`);
        return null;
      }

      const data = (await response.json()) as OpenCageResponse;

      // Check for valid results
      if (!data.results || data.results.length === 0) {
        return null;
      }

      const apiResult = data.results[0]!;

      const result: GeocodingResult = {
        lat: apiResult.geometry.lat,
        lng: apiResult.geometry.lng,
        formattedAddress: apiResult.formatted || null,
      };

      // Cache the result (fire and forget, don't block response)
      geocacheRepository
        .create({
          addressQuery: normalizedAddress,
          lat: result.lat,
          lng: result.lng,
          formattedAddress: result.formattedAddress,
        })
        .catch((err) => {
          console.warn('[Geocoding] Cache write failed:', err);
        });

      return result;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        console.error('[Geocoding] Request timeout');
        return null;
      }

      console.error('[Geocoding] Fetch error:', error);
      return null;
    }
  },
};
