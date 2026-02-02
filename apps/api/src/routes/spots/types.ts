// apps/api/src/routes/spots/types.ts

/**
 * Request body for creating a spot
 */
export interface CreateSpotRequest {
  lat: number;
  lng: number;
  accuracyMeters?: number;
}

/**
 * Response for a single spot
 */
export interface SpotResponse {
  id: string;
  lat: number;
  lng: number;
  accuracyMeters: number | null;
  address: string | null;
  photoUrl: string | null;
  note: string | null;
  floor: string | null;
  spotIdentifier: string | null;
  isActive: boolean;
  savedAt: string;
}

/**
 * Request body for updating a spot
 */
export interface UpdateSpotRequest {
  address?: string | null;
  photoUrl?: string | null;
  note?: string | null;
  floor?: string | null;
  spotIdentifier?: string | null;
}
