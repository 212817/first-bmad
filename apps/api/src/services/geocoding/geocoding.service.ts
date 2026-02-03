// apps/api/src/services/geocoding/geocoding.service.ts
import { env } from '../../config/env.js';
import { geocacheRepository } from '../../repositories/geocache.repository.js';
import type {
  GeocodingResult,
  GeocodingServiceInterface,
  OpenCageResponse,
  OpenCageComponents,
  ReverseGeocodingResult,
} from './types.js';

/** OpenCage API base URL */
const OPENCAGE_URL = 'https://api.opencagedata.com/geocode/v1/json';

/** Request timeout in milliseconds */
const REQUEST_TIMEOUT = 10000;

/** Precision for coordinate rounding (4 decimal places ≈ 11m accuracy) */
const COORD_PRECISION = 4;

/**
 * Round coordinate to specified precision for cache lookups
 */
const roundCoord = (coord: number, precision = COORD_PRECISION): number => {
  const factor = Math.pow(10, precision);
  return Math.round(coord * factor) / factor;
};

/**
 * Format address components into a short display string
 * Returns first 2-3 meaningful parts (road, neighborhood/suburb, city)
 */
const formatAddressFromComponents = (components: OpenCageComponents): string => {
  const parts: string[] = [];

  // Add road/street with optional house number
  if (components.road) {
    const road = components.house_number
      ? `${components.house_number} ${components.road}`
      : components.road;
    parts.push(road);
  }

  // Add neighborhood or suburb
  if (components.neighbourhood) {
    parts.push(components.neighbourhood);
  } else if (components.suburb) {
    parts.push(components.suburb);
  }

  // Add city/town/village
  const locality = components.city || components.town || components.village;
  if (locality) {
    parts.push(locality);
  }

  // Return first 2-3 meaningful parts
  return parts.slice(0, 3).join(', ');
};

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

  /**
   * Reverse geocode coordinates to address
   * Checks cache first (with precision tolerance), then calls OpenCage API
   */
  reverseGeocode: async (lat: number, lng: number): Promise<ReverseGeocodingResult | null> => {
    // Validate coordinates
    if (typeof lat !== 'number' || typeof lng !== 'number' || isNaN(lat) || isNaN(lng)) {
      return null;
    }

    if (lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      return null;
    }

    // Round coordinates for cache lookup
    const roundedLat = roundCoord(lat);
    const roundedLng = roundCoord(lng);

    // Check cache first (using coordinates)
    try {
      const cached = await geocacheRepository.findByCoords(roundedLat, roundedLng);
      if (cached) {
        return {
          address: cached.formattedAddress || '',
          formattedAddress: cached.formattedAddress || '',
        };
      }
    } catch (error) {
      // Log cache error but continue to API
      console.warn('[ReverseGeocoding] Cache lookup failed:', error);
    }

    // Call OpenCage API (same endpoint, pass coords as query)
    const url = new URL(OPENCAGE_URL);
    url.searchParams.set('q', `${lat}+${lng}`);
    url.searchParams.set('key', env.OPENCAGE_API_KEY);
    url.searchParams.set('limit', '1');

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
          console.warn('[ReverseGeocoding] Rate limit exceeded');
          return null;
        }
        // Payment required (quota exceeded)
        if (response.status === 402) {
          console.error('[ReverseGeocoding] API quota exceeded');
          return null;
        }
        console.error(`[ReverseGeocoding] API error: ${response.status}`);
        return null;
      }

      const data = (await response.json()) as OpenCageResponse;

      // Check for valid results
      if (!data.results || data.results.length === 0) {
        return null;
      }

      const apiResult = data.results[0]!;

      // Build short address from components, fallback to formatted
      const shortAddress = apiResult.components
        ? formatAddressFromComponents(apiResult.components)
        : apiResult.formatted;

      const result: ReverseGeocodingResult = {
        address: shortAddress || apiResult.formatted,
        formattedAddress: apiResult.formatted,
      };

      // Cache the result using rounded coordinates as the key
      const cacheKey = `${roundedLat},${roundedLng}`;
      geocacheRepository
        .create({
          addressQuery: cacheKey,
          lat: roundedLat,
          lng: roundedLng,
          formattedAddress: result.formattedAddress,
        })
        .catch((err) => {
          console.warn('[ReverseGeocoding] Cache write failed:', err);
        });

      return result;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error && error.name === 'AbortError') {
        console.error('[ReverseGeocoding] Request timeout');
        return null;
      }

      console.error('[ReverseGeocoding] Fetch error:', error);
      return null;
    }
  },
};
