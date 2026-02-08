// apps/api/src/repositories/spot.types.ts
import type { ParkingSpot } from '@repo/shared/types';

/**
 * Input for creating a new spot
 * Note: latitude/longitude can be null for address-only spots
 */
export interface CreateSpotInput {
  userId: string;
  carTagId?: string | null;
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
  carTagId?: string | null;
  address?: string | null;
  photoUrl?: string | null;
  note?: string | null;
  floor?: string | null;
  spotIdentifier?: string | null;
  meterExpiresAt?: Date | null;
  isActive?: boolean;
}

/**
 * Result of paginated spot query
 */
export interface PaginatedSpotsResult {
  spots: ParkingSpot[];
  nextCursor: string | null;
}

/**
 * Search/filter options for paginated spot queries
 */
export interface SpotSearchOptions {
  /** Text search query (searches address, note) */
  query?: string;
  /** Filter by car tag ID */
  carTagId?: string;
  /** Start date for date range filter */
  startDate?: Date;
  /** End date for date range filter */
  endDate?: Date;
}

/**
 * Spot repository interface
 */
export interface SpotRepositoryInterface {
  create(input: CreateSpotInput): Promise<ParkingSpot>;
  findById(id: string): Promise<ParkingSpot | null>;
  findByUserId(userId: string, limit?: number): Promise<ParkingSpot[]>;
  findByUserIdPaginated(
    userId: string,
    limit?: number,
    cursor?: string,
    searchOptions?: SpotSearchOptions
  ): Promise<PaginatedSpotsResult>;
  findActiveByUserId(userId: string): Promise<ParkingSpot | null>;
  findLatestByUserId(userId: string): Promise<ParkingSpot | null>;
  update(id: string, input: UpdateSpotInput): Promise<ParkingSpot | null>;
  delete(id: string): Promise<boolean>;
}
