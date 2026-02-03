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
 * Reverse geocoding result returned by the service
 */
export interface ReverseGeocodingResult {
  /** Short address for display (e.g., "Main St, Downtown") */
  address: string;
  /** Full formatted address from provider */
  formattedAddress: string;
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
  components?: OpenCageComponents;
}

/**
 * Address components from OpenCage API
 */
export interface OpenCageComponents {
  road?: string;
  house_number?: string;
  neighbourhood?: string;
  suburb?: string;
  city?: string;
  town?: string;
  village?: string;
  county?: string;
  state?: string;
  postcode?: string;
  country?: string;
  country_code?: string;
  _type?: string;
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

  /**
   * Reverse geocode coordinates to address
   * @param lat - Latitude coordinate
   * @param lng - Longitude coordinate
   * @returns ReverseGeocodingResult if found, null if not found
   */
  reverseGeocode: (lat: number, lng: number) => Promise<ReverseGeocodingResult | null>;
}

/**
 * OpenCage API rate limit error
 */
export interface RateLimitInfo {
  limit: number;
  remaining: number;
  reset: number;
}
