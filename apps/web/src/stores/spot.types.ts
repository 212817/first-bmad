// apps/web/src/stores/spot.types.ts

/**
 * Spot data for local storage (guest mode) and API responses
 */
export interface Spot {
  id: string;
  lat: number;
  lng: number;
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
 * Input for saving a new spot
 */
export interface SaveSpotInput {
  lat: number;
  lng: number;
  accuracy: number;
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
  clearSpot: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}
