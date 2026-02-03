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
 */
export interface SaveSpotWithCoordsInput {
  lat: number;
  lng: number;
  accuracy: number;
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
  address?: string | null;
  photoUrl?: string | null;
  note?: string | null;
  floor?: string | null;
  spotIdentifier?: string | null;
}

/**
 * Spot store state
 */
export interface SpotState {
  currentSpot: Spot | null;
  isLoading: boolean;
  isSaving: boolean;
  error: string | null;
}

/**
 * Spot store actions
 */
export interface SpotActions {
  saveSpot: (position: SaveSpotInput) => Promise<Spot>;
  updateSpot: (id: string, data: UpdateSpotInput) => Promise<Spot>;
  clearSpot: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}
