// apps/web/src/stores/spot.types.ts

/**
 * Spot data for local storage (guest mode) and API responses
 * Note: lat/lng can be null for address-only spots (manual entry without geocoding)
 */
export interface Spot {
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
  isActive: boolean;
  savedAt: string;
}

/**
 * Input for saving a new spot with GPS coordinates
 * accuracy can be null/undefined for manually set positions
 */
export interface SaveSpotWithCoordsInput {
  lat: number;
  lng: number;
  accuracy?: number | null;
}

/**
 * Input for saving a new spot with address only (manual entry)
 */
export interface SaveSpotWithAddressInput {
  address: string;
  lat?: number | null;
  lng?: number | null;
}

/**
 * Combined save spot input type
 */
export type SaveSpotInput = SaveSpotWithCoordsInput | SaveSpotWithAddressInput;

/**
 * Type guard for address-only input
 */
export const isAddressInput = (input: SaveSpotInput): input is SaveSpotWithAddressInput => {
  return 'address' in input;
};

/**
 * Input for updating a spot
 */
export interface UpdateSpotInput {
  carTagId?: string | null;
  lat?: number;
  lng?: number;
  accuracy?: number;
  address?: string | null;
  photoUrl?: string | null;
  note?: string | null;
  floor?: string | null;
  spotIdentifier?: string | null;
}

/**
 * Paginated spots response from API
 */
export interface PaginatedSpotsResponse {
  data: Spot[];
  meta: {
    limit: number;
    nextCursor: string | null;
  };
}

/**
 * Search/filter options for spot history
 */
export interface SpotFilters {
  /** Filter by car tag ID */
  carTagId?: string;
  /** Start date for date range filter */
  startDate?: Date;
  /** End date for date range filter */
  endDate?: Date;
}

/**
 * Share link response from API
 */
export interface ShareLinkResponse {
  shareUrl: string;
  expiresAt: string;
}

/**
 * Spot store state
 */
export interface SpotState {
  currentSpot: Spot | null;
  latestSpot: Spot | null;
  isLoading: boolean;
  isLoadingLatest: boolean;
  isSaving: boolean;
  error: string | null;
  // History state
  spots: Spot[];
  hasMore: boolean;
  nextCursor: string | null;
  isLoadingSpots: boolean;
  isLoadingMore: boolean;
  // Search/filter state
  searchQuery: string;
  filters: SpotFilters;
}

/**
 * Spot store actions
 */
export interface SpotActions {
  saveSpot: (position: SaveSpotInput) => Promise<Spot>;
  updateSpot: (id: string, data: UpdateSpotInput) => Promise<Spot>;
  fetchLatestSpot: () => Promise<Spot | null>;
  getSpotById: (spotId: string) => Promise<Spot | null>;
  deleteSpot: (spotId: string) => Promise<boolean>;
  clearSpot: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  // History actions
  fetchSpots: (cursor?: string) => Promise<void>;
  loadMore: () => Promise<void>;
  clearHistory: () => void;
  // Search/filter actions
  setSearchQuery: (query: string) => void;
  setFilters: (filters: SpotFilters) => void;
  clearFilters: () => void;
  // Share actions
  createShareLink: (spotId: string) => Promise<ShareLinkResponse>;
  // Current spot management
  setCurrentSpot: (spot: Spot | null) => void;
}
