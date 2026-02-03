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
