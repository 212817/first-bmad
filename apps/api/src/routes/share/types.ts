// apps/api/src/routes/share/types.ts
import type { ParkingSpot } from '@repo/shared/types';

/**
 * Shared spot response - public data only (no userId)
 */
export interface SharedSpotResponse {
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
 * Map ParkingSpot to public SharedSpotResponse
 */
export const mapToSharedSpotResponse = (
  spot: ParkingSpot,
  expiresAt: Date
): SharedSpotResponse => ({
  id: spot.id,
  lat: spot.latitude,
  lng: spot.longitude,
  address: spot.address,
  photoUrl: spot.photoUrl,
  note: spot.note,
  floor: spot.floor,
  spotIdentifier: spot.spotIdentifier,
  savedAt: spot.savedAt.toISOString(),
  expiresAt: expiresAt.toISOString(),
});
