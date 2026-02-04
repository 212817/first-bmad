// apps/web/src/stores/spotStore.ts
import { create } from 'zustand';
import { apiClient } from '@/services/api/client';
import { indexedDbService } from '@/services/storage/indexedDb.service';
import { STORES } from '@/services/storage/types';
import { useGuestStore } from './guestStore';
import type {
  SpotState,
  SpotActions,
  Spot,
  SaveSpotInput,
  UpdateSpotInput,
  PaginatedSpotsResponse,
} from './spot.types';
import { isAddressInput } from './spot.types';

const DEFAULT_PAGE_SIZE = 20;

/**
 * Spot store for managing parking spot state
 * Routes to API (authenticated) or IndexedDB (guest) based on auth mode
 */
export const useSpotStore = create<SpotState & SpotActions>((set, get) => ({
  currentSpot: null,
  latestSpot: null,
  isLoading: false,
  isLoadingLatest: false,
  isSaving: false,
  error: null,
  // History state
  spots: [],
  hasMore: true,
  nextCursor: null,
  isLoadingSpots: false,
  isLoadingMore: false,

  /**
   * Save a new parking spot
   * Uses API for authenticated users, IndexedDB for guests
   * Supports both GPS coordinates and address-only saves
   */
  saveSpot: async (input: SaveSpotInput): Promise<Spot> => {
    set({ isSaving: true, error: null });

    const isGuest = useGuestStore.getState().isGuest;
    const isAddress = isAddressInput(input);

    try {
      let spot: Spot;

      if (isGuest) {
        // Save to IndexedDB for guest users
        if (isAddress) {
          // Address-only save (manual entry)
          spot = {
            id: crypto.randomUUID(),
            carTagId: null,
            lat: input.lat ?? null,
            lng: input.lng ?? null,
            accuracyMeters: null,
            address: input.address,
            photoUrl: null,
            note: null,
            floor: null,
            spotIdentifier: null,
            isActive: true,
            savedAt: new Date().toISOString(),
          };
        } else {
          // GPS coordinates save
          spot = {
            id: crypto.randomUUID(),
            carTagId: null,
            lat: input.lat,
            lng: input.lng,
            accuracyMeters: input.accuracy != null ? Math.round(input.accuracy) : null,
            address: null,
            photoUrl: null,
            note: null,
            floor: null,
            spotIdentifier: null,
            isActive: true,
            savedAt: new Date().toISOString(),
          };
        }

        await indexedDbService.setItem(STORES.spots, spot.id, spot);
      } else {
        // Save to API for authenticated users
        if (isAddress) {
          // Address-only save (manual entry)
          const response = await apiClient.post<{ success: boolean; data: Spot }>('/v1/spots', {
            lat: input.lat ?? null,
            lng: input.lng ?? null,
            address: input.address,
          });
          spot = response.data.data;
        } else {
          // GPS coordinates save
          const response = await apiClient.post<{ success: boolean; data: Spot }>('/v1/spots', {
            lat: input.lat,
            lng: input.lng,
            accuracyMeters: input.accuracy != null ? Math.round(input.accuracy) : null,
          });
          spot = response.data.data;
        }
      }

      // Update both currentSpot and latestSpot when saving a new spot
      set({ currentSpot: spot, latestSpot: spot, isSaving: false });
      return spot;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save spot';
      set({ error: message, isSaving: false });
      throw error;
    }
  },

  /**
   * Fetch the latest spot from API (authenticated) or IndexedDB (guest)
   * Returns the most recently saved spot
   */
  fetchLatestSpot: async (): Promise<Spot | null> => {
    set({ isLoadingLatest: true, error: null });

    const isGuest = useGuestStore.getState().isGuest;

    try {
      let spot: Spot | null = null;

      if (isGuest) {
        // Get from IndexedDB for guest users
        spot = await indexedDbService.getLatestSpot<Spot>();
      } else {
        // Get from API for authenticated users
        try {
          const response = await apiClient.get<{ success: boolean; data: Spot }>(
            '/v1/spots/latest'
          );
          spot = response.data.data;
        } catch (error) {
          // If 404, no spots exist - this is not an error state
          if (error instanceof Error && 'response' in error) {
            const axiosError = error as { response?: { status?: number } };
            if (axiosError.response?.status === 404) {
              spot = null;
            } else {
              throw error;
            }
          } else {
            throw error;
          }
        }
      }

      set({ latestSpot: spot, isLoadingLatest: false });
      return spot;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch latest spot';
      set({ error: message, isLoadingLatest: false });
      throw error;
    }
  },

  /**
   * Clear current spot from state
   */
  clearSpot: () => {
    set({ currentSpot: null, error: null });
  },

  /**
   * Get a single spot by ID
   * Routes to API (authenticated) or IndexedDB (guest)
   */
  getSpotById: async (spotId: string): Promise<Spot | null> => {
    // Check if we have it locally first
    const local = get().spots.find((s) => s.id === spotId);
    if (local) return local;

    const isGuest = useGuestStore.getState().isGuest;

    if (isGuest) {
      // Fetch from IndexedDB for guest users
      return await indexedDbService.getItem<Spot>(STORES.spots, spotId);
    }

    // Fetch from API for authenticated users
    try {
      const response = await apiClient.get<{ success: boolean; data: Spot }>(`/v1/spots/${spotId}`);
      return response.data.data;
    } catch (error) {
      // If 404, return null
      if (error instanceof Error && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 404) {
          return null;
        }
      }
      throw error;
    }
  },

  /**
   * Update an existing spot
   * Uses API for authenticated users, IndexedDB for guests
   */
  updateSpot: async (id: string, data: UpdateSpotInput): Promise<Spot> => {
    set({ isSaving: true, error: null });

    const isGuest = useGuestStore.getState().isGuest;

    try {
      let updatedSpot: Spot;

      if (isGuest) {
        // Update in IndexedDB for guest users
        const existingSpot = await indexedDbService.getItem<Spot>(STORES.spots, id);
        if (!existingSpot) {
          throw new Error('Spot not found');
        }

        updatedSpot = {
          ...existingSpot,
          ...data,
        };

        await indexedDbService.setItem(STORES.spots, id, updatedSpot);
      } else {
        // Update via API for authenticated users
        const response = await apiClient.patch<{ success: boolean; data: Spot }>(
          `/v1/spots/${id}`,
          data
        );

        updatedSpot = response.data.data;
      }

      set({ currentSpot: updatedSpot, isSaving: false });
      return updatedSpot;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to update spot';
      set({ error: message, isSaving: false });
      throw error;
    }
  },

  /**
   * Set loading state
   */
  setLoading: (loading: boolean) => {
    set({ isLoading: loading });
  },

  /**
   * Set error state
   */
  setError: (error: string | null) => {
    set({ error });
  },

  /**
   * Fetch spots with pagination
   * Routes to API (authenticated) or IndexedDB (guest)
   */
  fetchSpots: async (cursor?: string): Promise<void> => {
    const isGuest = useGuestStore.getState().isGuest;
    const isInitialLoad = !cursor;

    if (isInitialLoad) {
      set({ isLoadingSpots: true, error: null });
    } else {
      set({ isLoadingMore: true, error: null });
    }

    try {
      let spots: Spot[];
      let nextCursor: string | null;

      if (isGuest) {
        // Get from IndexedDB for guest users
        const result = await indexedDbService.getSpotsPaginated<Spot>(DEFAULT_PAGE_SIZE, cursor);
        spots = result.spots;
        nextCursor = result.nextCursor;
      } else {
        // Get from API for authenticated users
        const params = new URLSearchParams({ limit: String(DEFAULT_PAGE_SIZE) });
        if (cursor) {
          params.set('cursor', cursor);
        }

        const response = await apiClient.get<{ success: boolean } & PaginatedSpotsResponse>(
          `/v1/spots?${params.toString()}`
        );

        spots = response.data.data;
        nextCursor = response.data.meta.nextCursor;
      }

      if (isInitialLoad) {
        set({
          spots,
          hasMore: nextCursor !== null,
          nextCursor,
          isLoadingSpots: false,
        });
      } else {
        set((state) => ({
          spots: [...state.spots, ...spots],
          hasMore: nextCursor !== null,
          nextCursor,
          isLoadingMore: false,
        }));
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch spots';
      set({
        error: message,
        isLoadingSpots: false,
        isLoadingMore: false,
      });
    }
  },

  /**
   * Load more spots (using the current cursor)
   */
  loadMore: async (): Promise<void> => {
    const { hasMore, nextCursor, isLoadingMore } = get();

    if (!hasMore || isLoadingMore) {
      return;
    }

    await get().fetchSpots(nextCursor ?? undefined);
  },

  /**
   * Delete a spot by ID
   * Uses API for authenticated users, IndexedDB for guests
   * Returns true if deletion was successful
   */
  deleteSpot: async (spotId: string): Promise<boolean> => {
    const isGuest = useGuestStore.getState().isGuest;

    try {
      if (isGuest) {
        // Delete from IndexedDB for guest users
        await indexedDbService.deleteItem(STORES.spots, spotId);
      } else {
        // Delete via API for authenticated users
        await apiClient.delete(`/v1/spots/${spotId}`);
      }

      // Remove from local state
      set((state) => {
        const newSpots = state.spots.filter((s) => s.id !== spotId);
        // Update latestSpot if the deleted spot was the latest
        const newLatest =
          state.latestSpot?.id === spotId ? (newSpots[0] ?? null) : state.latestSpot;

        return {
          spots: newSpots,
          latestSpot: newLatest,
          // Also clear currentSpot if it was the deleted spot
          currentSpot: state.currentSpot?.id === spotId ? null : state.currentSpot,
        };
      });

      return true;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to delete spot';
      set({ error: message });
      return false;
    }
  },

  /**
   * Clear history state
   */
  clearHistory: () => {
    set({
      spots: [],
      hasMore: true,
      nextCursor: null,
      isLoadingSpots: false,
      isLoadingMore: false,
    });
  },
}));
