// apps/web/src/utils/filterSpots.ts
import type { Spot } from '@/stores/spot.types';

/**
 * Filter options for client-side spot filtering
 */
export interface SpotFilterOptions {
  /** Text query to search in address, note, and tag */
  query?: string;
  /** Filter by car tag ID */
  carTagId?: string;
  /** Start date for date range filter */
  startDate?: Date;
  /** End date for date range filter */
  endDate?: Date;
}

/**
 * Filter spots based on search query and filters
 * Used for client-side filtering in guest mode
 *
 * @param spots - Array of spots to filter
 * @param options - Filter options
 * @param carTagNameLookup - Function to get tag name from tag ID
 * @returns Filtered array of spots
 */
export const filterSpots = (
  spots: Spot[],
  options: SpotFilterOptions,
  carTagNameLookup?: (tagId: string) => string | undefined
): Spot[] => {
  const { query, carTagId, startDate, endDate } = options;

  // No filters, return all
  if (!query && !carTagId && !startDate && !endDate) {
    return spots;
  }

  return spots.filter((spot) => {
    // Text search (case-insensitive)
    if (query) {
      const q = query.toLowerCase().trim();
      if (!q) return true;

      const matchesAddress = spot.address?.toLowerCase().includes(q) ?? false;
      const matchesNote = spot.note?.toLowerCase().includes(q) ?? false;

      // Get tag name from ID if lookup function provided
      let matchesTag = false;
      if (spot.carTagId && carTagNameLookup) {
        const tagName = carTagNameLookup(spot.carTagId);
        matchesTag = tagName?.toLowerCase().includes(q) ?? false;
      }

      if (!matchesAddress && !matchesNote && !matchesTag) {
        return false;
      }
    }

    // Car tag filter by ID (simple match - all spots now have carTagId)
    if (carTagId && spot.carTagId !== carTagId) {
      return false;
    }

    // Date range filter
    const savedAt = new Date(spot.savedAt);

    if (startDate && savedAt < startDate) {
      return false;
    }

    if (endDate && savedAt > endDate) {
      return false;
    }

    return true;
  });
};
