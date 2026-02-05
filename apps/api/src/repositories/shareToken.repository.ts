// apps/api/src/repositories/shareToken.repository.ts
import { eq, lt } from 'drizzle-orm';
import { db } from '../config/db.js';
import { shareTokens, parkingSpots } from '@repo/shared/db';
import type {
  ShareToken,
  ShareTokenWithSpot,
  CreateShareTokenInput,
  ShareTokenRepositoryInterface,
} from './shareToken.types.js';
import type { ParkingSpot } from '@repo/shared/types';

/**
 * Safely converts a value to a Date object
 */
const toDate = (value: Date | string | null | undefined): Date => {
  if (value instanceof Date) return value;
  if (typeof value === 'string' && value) return new Date(value);
  return new Date();
};

/**
 * Maps database row to ShareToken entity
 */
const mapToShareToken = (row: typeof shareTokens.$inferSelect): ShareToken => ({
  id: row.id,
  token: row.token,
  spotId: row.spotId,
  createdAt: toDate(row.createdAt),
  expiresAt: toDate(row.expiresAt),
});

/**
 * Maps database row to ParkingSpot entity
 */
const mapToSpot = (row: typeof parkingSpots.$inferSelect): ParkingSpot => ({
  id: row.id,
  userId: row.userId,
  carTagId: row.carTagId,
  latitude: row.latitude,
  longitude: row.longitude,
  accuracyMeters: row.accuracyMeters,
  address: row.address,
  photoUrl: row.photoUrl,
  note: row.note,
  floor: row.floor,
  spotIdentifier: row.spotIdentifier,
  isActive: row.isActive,
  savedAt: toDate(row.savedAt),
  createdAt: toDate(row.createdAt),
  updatedAt: toDate(row.updatedAt),
});

/**
 * Share token repository - data access layer for share_tokens table
 */
export const shareTokenRepository: ShareTokenRepositoryInterface = {
  /**
   * Create a new share token
   */
  async create(input: CreateShareTokenInput): Promise<ShareToken> {
    const rows = await db
      .insert(shareTokens)
      .values({
        spotId: input.spotId,
        token: input.token,
        expiresAt: input.expiresAt,
      })
      .returning();

    return mapToShareToken(rows[0]!);
  },

  /**
   * Find share token by token string, includes spot data
   * Returns null if token not found or expired
   */
  async findByToken(token: string): Promise<ShareTokenWithSpot | null> {
    const rows = await db
      .select({
        shareToken: shareTokens,
        spot: parkingSpots,
      })
      .from(shareTokens)
      .innerJoin(parkingSpots, eq(shareTokens.spotId, parkingSpots.id))
      .where(eq(shareTokens.token, token))
      .limit(1);

    if (!rows[0]) return null;

    const { shareToken, spot } = rows[0];
    const tokenData = mapToShareToken(shareToken);

    // Check if expired
    if (tokenData.expiresAt < new Date()) {
      return null;
    }

    return {
      ...tokenData,
      spot: mapToSpot(spot),
    };
  },

  /**
   * Delete all expired tokens
   * Returns the count of deleted tokens
   */
  async deleteExpired(): Promise<number> {
    const result = await db
      .delete(shareTokens)
      .where(lt(shareTokens.expiresAt, new Date()))
      .returning({ id: shareTokens.id });

    return result.length;
  },

  /**
   * Delete all tokens for a specific spot
   */
  async deleteBySpotId(spotId: string): Promise<void> {
    await db.delete(shareTokens).where(eq(shareTokens.spotId, spotId));
  },
};
