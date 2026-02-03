// apps/api/src/repositories/spot.repository.ts
import { eq, desc, lt, and } from 'drizzle-orm';
import { db } from '../config/db.js';
import { parkingSpots } from '@repo/shared/db';
import type { ParkingSpot } from '@repo/shared/types';
import type {
  CreateSpotInput,
  UpdateSpotInput,
  SpotRepositoryInterface,
  PaginatedSpotsResult,
} from './spot.types.js';

/**
 * Safely converts a value to a Date object
 */
const toDate = (value: Date | string | null | undefined): Date => {
  if (value instanceof Date) return value;
  if (typeof value === 'string' && value) return new Date(value);
  return new Date(); // fallback to current time if null/undefined
};

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
 * Spot repository - data access layer for parking_spots table
 */
export const spotRepository: SpotRepositoryInterface = {
  /**
   * Create a new parking spot
   */
  async create(input: CreateSpotInput): Promise<ParkingSpot> {
    const rows = await db
      .insert(parkingSpots)
      .values({
        userId: input.userId,
        carTagId: input.carTagId ?? null,
        latitude: input.latitude,
        longitude: input.longitude,
        accuracyMeters: input.accuracyMeters ?? null,
        address: input.address ?? null,
        photoUrl: input.photoUrl ?? null,
        note: input.note ?? null,
        floor: input.floor ?? null,
        spotIdentifier: input.spotIdentifier ?? null,
      })
      .returning();

    return mapToSpot(rows[0]!);
  },

  /**
   * Find spot by ID
   */
  async findById(id: string): Promise<ParkingSpot | null> {
    const rows = await db.select().from(parkingSpots).where(eq(parkingSpots.id, id)).limit(1);
    return rows[0] ? mapToSpot(rows[0]) : null;
  },

  /**
   * Find spots by user ID, ordered by savedAt descending
   */
  async findByUserId(userId: string, limit = 50): Promise<ParkingSpot[]> {
    const rows = await db
      .select()
      .from(parkingSpots)
      .where(eq(parkingSpots.userId, userId))
      .orderBy(desc(parkingSpots.savedAt))
      .limit(limit);

    return rows.map(mapToSpot);
  },

  /**
   * Find spots by user ID with cursor-based pagination
   * Returns spots ordered by savedAt descending
   * Uses cursor (ISO timestamp string) to fetch next page
   */
  async findByUserIdPaginated(
    userId: string,
    limit = 20,
    cursor?: string
  ): Promise<PaginatedSpotsResult> {
    // Fetch one extra to determine if there are more results
    const fetchLimit = limit + 1;

    let rows;
    if (cursor) {
      // Parse cursor as ISO date string
      const cursorDate = new Date(cursor);
      rows = await db
        .select()
        .from(parkingSpots)
        .where(and(eq(parkingSpots.userId, userId), lt(parkingSpots.savedAt, cursorDate)))
        .orderBy(desc(parkingSpots.savedAt))
        .limit(fetchLimit);
    } else {
      rows = await db
        .select()
        .from(parkingSpots)
        .where(eq(parkingSpots.userId, userId))
        .orderBy(desc(parkingSpots.savedAt))
        .limit(fetchLimit);
    }

    const hasMore = rows.length > limit;
    const items = hasMore ? rows.slice(0, limit) : rows;
    const spots = items.map(mapToSpot);

    // Next cursor is the savedAt of the last item
    const nextCursor =
      hasMore && spots.length > 0 ? spots[spots.length - 1]!.savedAt.toISOString() : null;

    return { spots, nextCursor };
  },

  /**
   * Find the active spot for a user (most recent with isActive = true)
   */
  async findActiveByUserId(userId: string): Promise<ParkingSpot | null> {
    const rows = await db
      .select()
      .from(parkingSpots)
      .where(eq(parkingSpots.userId, userId))
      .orderBy(desc(parkingSpots.savedAt))
      .limit(1);

    const spot = rows[0];
    return spot && spot.isActive ? mapToSpot(spot) : null;
  },

  /**
   * Find the most recent spot for a user (regardless of isActive status)
   * Returns the latest spot ordered by savedAt DESC
   */
  async findLatestByUserId(userId: string): Promise<ParkingSpot | null> {
    const rows = await db
      .select()
      .from(parkingSpots)
      .where(eq(parkingSpots.userId, userId))
      .orderBy(desc(parkingSpots.savedAt))
      .limit(1);

    return rows[0] ? mapToSpot(rows[0]) : null;
  },

  /**
   * Update a spot
   */
  async update(id: string, input: UpdateSpotInput): Promise<ParkingSpot | null> {
    const rows = await db
      .update(parkingSpots)
      .set({
        ...input,
        updatedAt: new Date(),
      })
      .where(eq(parkingSpots.id, id))
      .returning();

    return rows[0] ? mapToSpot(rows[0]) : null;
  },

  /**
   * Delete a spot (hard delete)
   */
  async delete(id: string): Promise<boolean> {
    const result = await db.delete(parkingSpots).where(eq(parkingSpots.id, id)).returning();
    return result.length > 0;
  },
};
