// apps/web/src/services/api/shareApi.ts
import { apiClient } from './client';

/**
 * Shared spot data returned from API
 */
export interface SharedSpot {
  id: string;
  lat: number | null;
  lng: number | null;
  address: string | null;
  photoUrl: string | null;
  note: string | null;
  floor: string | null;
  spotIdentifier: string | null;
  savedAt: string;
  expiresAt: string;
}

/**
 * API response wrapper
 */
interface ApiResponse<T> {
  success: boolean;
  data: T;
}

/**
 * Share API - public endpoints for accessing shared spots
 */
export const shareApi = {
  /**
   * Get shared spot by token (public - no auth required)
   */
  getSharedSpot: async (token: string): Promise<SharedSpot> => {
    const response = await apiClient.get<ApiResponse<SharedSpot>>(`/v1/share/${token}`);
    return response.data.data;
  },
};
