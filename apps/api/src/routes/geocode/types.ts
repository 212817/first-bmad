// apps/api/src/routes/geocode/types.ts

/**
 * Request body for geocoding endpoint
 */
export interface GeocodeRequest {
  address: string;
}

/**
 * Response for successful geocoding
 */
export interface GeocodeResponse {
  lat: number;
  lng: number;
  formattedAddress: string | null;
}

/**
 * Request body for reverse geocoding endpoint
 */
export interface ReverseGeocodeRequest {
  lat: number;
  lng: number;
}

/**
 * Response for successful reverse geocoding
 */
export interface ReverseGeocodeResponse {
  address: string;
  formattedAddress: string;
}
