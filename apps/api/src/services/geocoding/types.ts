// apps/api/src/services/geocoding/types.ts

/**
 * Geocoding result returned by the service
 */
export interface GeocodingResult {
  /** Latitude coordinate */
  lat: number;
  /** Longitude coordinate */
  lng: number;
  /** Formatted address from geocoding provider */
  formattedAddress: string | null;
}

/**
 * OpenCage API response structure
 */
export interface OpenCageResponse {
  results: OpenCageResult[];
  status: {
    code: number;
    message: string;
  };
  rate: {
    limit: number;
    remaining: number;
    reset: number;
  };
}

/**
 * Single result from OpenCage API
 */
export interface OpenCageResult {
  geometry: {
    lat: number;
    lng: number;
  };
  formatted: string;
  confidence: number;
}

/**
 * Geocoding service interface
 */
export interface GeocodingServiceInterface {
  /**
   * Geocode an address string to coordinates
   * @param address - The address to geocode
   * @returns GeocodingResult if found, null if not found
   */
  geocodeAddress: (address: string) => Promise<GeocodingResult | null>;
}

/**
 * OpenCage API rate limit error
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}
