// apps/api/src/repositories/geocache.types.ts

/**
 * Geocache entry stored in database
 */
export interface GeocacheEntry {
  id: string;
  addressQuery: string;
  lat: number;
  lng: number;
  formattedAddress: string | null;
  createdAt: Date;
}

/**
 * Input for creating a geocache entry
 */
export interface CreateGeocacheInput {
  addressQuery: string;
  lat: number;
  lng: number;
  formattedAddress?: string | null;
}

/**
 * Geocache repository interface
 */
export interface GeocacheRepositoryInterface {
  /**
   * Find a cached geocoding result by normalized address query
   */
  findByAddress(query: string): Promise<GeocacheEntry | null>;

  /**
   * Find a cached reverse geocoding result by coordinates
   * Uses rounded coordinates for matching
   */
  findByCoords(lat: number, lng: number): Promise<GeocacheEntry | null>;

  /**
   * Create a new geocache entry
   */
  create(input: CreateGeocacheInput): Promise<GeocacheEntry>;
}
