// apps/api/src/repositories/geocache.repository.ts
import { eq } from 'drizzle-orm';
import { db } from '../config/db.js';
import { geocodingCache } from '@repo/shared/db';
import type {
  GeocacheEntry,
  CreateGeocacheInput,
  GeocacheRepositoryInterface,
} from './geocache.types.js';

/**
 * Safely converts a value to a Date object
 */
const toDate = (value: Date | string | null | undefined): Date => {
  if (value instanceof Date) return value;
  if (typeof value === 'string' && value) return new Date(value);
  return new Date(); // fallback to current time if null/undefined
};

/**
 * Maps database row to GeocacheEntry
 */
const mapToEntry = (row: typeof geocodingCache.$inferSelect): GeocacheEntry => ({
  id: row.id,
  addressQuery: row.addressQuery,
  lat: row.lat,
  lng: row.lng,
  formattedAddress: row.formattedAddress,
  createdAt: toDate(row.createdAt),
});

/**
 * Normalize address query for consistent caching
 * - Lowercase
 * - Trim whitespace
 */
const normalizeQuery = (query: string): string => {
  return query.toLowerCase().trim();
};

/**
 * Geocache repository - data access layer for geocoding_cache table
 */
export const geocacheRepository: GeocacheRepositoryInterface = {
  /**
   * Find a cached geocoding result by normalized address query
   */
  async findByAddress(query: string): Promise<GeocacheEntry | null> {
    const normalized = normalizeQuery(query);

    const rows = await db
      .select()
      .from(geocodingCache)
      .where(eq(geocodingCache.addressQuery, normalized))
      .limit(1);

    return rows[0] ? mapToEntry(rows[0]) : null;
  },

  /**
   * Create a new geocache entry
   */
  async create(input: CreateGeocacheInput): Promise<GeocacheEntry> {
    const normalized = normalizeQuery(input.addressQuery);

    const rows = await db
      .insert(geocodingCache)
      .values({
        addressQuery: normalized,
        lat: input.lat,
        lng: input.lng,
        formattedAddress: input.formattedAddress ?? null,
      })
      .returning();

    return mapToEntry(rows[0]!);
  },
};
