// apps/api/src/repositories/spot.types.ts
import type { ParkingSpot } from '@repo/shared/types';

/**
 * Input for creating a new spot
 * Note: latitude/longitude can be null for address-only spots
 */
export interface CreateSpotInput {
  userId: string;
  latitude: number | null;
  longitude: number | null;
  accuracyMeters?: number | null;
  address?: string | null;
  photoUrl?: string | null;
  note?: string | null;
  floor?: string | null;
  spotIdentifier?: string | null;
}

/**
 * Input for updating a spot
 */
export interface UpdateSpotInput {
  address?: string | null;
  photoUrl?: string | null;
  note?: string | null;
  floor?: string | null;
  spotIdentifier?: string | null;
  isActive?: boolean;
}

/**
 * Spot repository interface
 */
export interface SpotRepositoryInterface {
  create(input: CreateSpotInput): Promise<ParkingSpot>;
  findById(id: string): Promise<ParkingSpot | null>;
  findByUserId(userId: string, limit?: number): Promise<ParkingSpot[]>;
  findActiveByUserId(userId: string): Promise<ParkingSpot | null>;
  update(id: string, input: UpdateSpotInput): Promise<ParkingSpot | null>;
  delete(id: string): Promise<boolean>;
}
