// apps/api/src/repositories/shareToken.types.ts
import type { ParkingSpot } from '@repo/shared/types';

/**
 * Share token entity
 */
export interface ShareToken {
  id: string;
  token: string;
  spotId: string;
  createdAt: Date;
  expiresAt: Date;
}

/**
 * Share token with associated spot data
 */
export interface ShareTokenWithSpot extends ShareToken {
  spot: ParkingSpot;
}

/**
 * Create share token input
 */
export interface CreateShareTokenInput {
  spotId: string;
  token: string;
  expiresAt: Date;
}

/**
 * Share token repository interface
 */
export interface ShareTokenRepositoryInterface {
  create(input: CreateShareTokenInput): Promise<ShareToken>;
  findByToken(token: string): Promise<ShareTokenWithSpot | null>;
  deleteExpired(): Promise<number>;
  deleteBySpotId(spotId: string): Promise<void>;
}
