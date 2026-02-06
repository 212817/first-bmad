// apps/api/src/routes/spots/types.ts

/**
 * Request body for creating a spot with GPS coordinates
 */
export interface CreateSpotWithCoordsRequest {
  lat: number;
  lng: number;
  accuracyMeters?: number;
}

/**
 * Request body for creating a spot with address only (manual entry)
 */
export interface CreateSpotWithAddressRequest {
  address: string;
  lat?: number | null;
  lng?: number | null;
}

/**
 * Combined request body for creating a spot
 * Supports both GPS coordinates and address-only modes
 */
export type CreateSpotRequest = CreateSpotWithCoordsRequest | CreateSpotWithAddressRequest;

/**
 * Type guard for address-only spot creation
 */
export const isAddressOnlyRequest = (
  req: CreateSpotRequest
): req is CreateSpotWithAddressRequest => {
  return 'address' in req && typeof req.address === 'string';
};

/**
 * Response for a single spot
 * Note: lat/lng can be null for address-only spots
 */
export interface SpotResponse {
  id: string;
  carTagId: string | null;
  lat: number | null;
  lng: number | null;
  accuracyMeters: number | null;
  address: string | null;
  photoUrl: string | null;
  note: string | null;
  floor: string | null;
  spotIdentifier: string | null;
  meterExpiresAt: string | null;
  isActive: boolean;
  savedAt: string;
}

/**
 * Request body for updating a spot
 */
export interface UpdateSpotRequest {
  carTagId?: string | null;
  lat?: number;
  lng?: number;
  accuracy?: number;
  address?: string | null;
  photoUrl?: string | null;
  note?: string | null;
  floor?: string | null;
  spotIdentifier?: string | null;
  meterExpiresAt?: string | null;
}

/**
 * Response for share link creation
 */
export interface CreateShareLinkResponse {
  shareUrl: string;
  expiresAt: string;
}
