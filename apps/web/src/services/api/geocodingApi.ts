// apps/web/src/services/api/geocodingApi.ts
import { apiClient } from './client';

/**
 * Geocoding result from API
 */
export interface GeocodingResult {
  lat: number;
  lng: number;
  formattedAddress: string | null;
}

/**
 * API response structure
 */
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

/**
 * Geocoding API service
 */
export const geocodingApi = {
  /**
   * Geocode an address to coordinates
   * @param address - The address to geocode
   * @returns Geocoding result or null if not found
   */
  async geocodeAddress(address: string): Promise<GeocodingResult | null> {
    try {
      const response = await apiClient.post<ApiResponse<GeocodingResult>>('/v1/geocode', {
        address,
      });

      if (response.data.success && response.data.data) {
        return response.data.data;
      }

      return null;
    } catch (error) {
      // Handle 404 (address not found) gracefully
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 404) {
          return null;
        }
      }

      // Re-throw other errors
      throw error;
    }
  },
};
