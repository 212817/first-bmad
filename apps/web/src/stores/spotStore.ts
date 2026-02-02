// apps/web/src/stores/spotStore.ts
import { create } from 'zustand';
import { apiClient } from '@/services/api/client';
import { indexedDbService } from '@/services/storage/indexedDb.service';
import { STORES } from '@/services/storage/types';
import { useGuestStore } from './guestStore';
import type { SpotState, SpotActions, Spot, SaveSpotInput } from './spot.types';

/**
 * Spot store for managing parking spot state
 * Routes to API (authenticated) or IndexedDB (guest) based on auth mode
 */
export const useSpotStore = create<SpotState & SpotActions>((set) => ({
  currentSpot: null,
  isLoading: false,
  isSaving: false,
  error: null,

  /**
   * Save a new parking spot
   * Uses API for authenticated users, IndexedDB for guests
   */
  saveSpot: async (position: SaveSpotInput): Promise<Spot> => {
    set({ isSaving: true, error: null });

    const isGuest = useGuestStore.getState().isGuest;

    try {
      let spot: Spot;

      if (isGuest) {
        // Save to IndexedDB for guest users
        spot = {
          id: crypto.randomUUID(),
          lat: position.lat,
          lng: position.lng,
          accuracyMeters: Math.round(position.accuracy),
          address: null,
          photoUrl: null,
          note: null,
          floor: null,
          spotIdentifier: null,
          isActive: true,
          savedAt: new Date().toISOString(),
        };

        await indexedDbService.setItem(STORES.spots, spot.id, spot);
      } else {
        // Save to API for authenticated users
        const response = await apiClient.post<{ success: boolean; data: Spot }>('/v1/spots', {
          lat: position.lat,
          lng: position.lng,
          accuracyMeters: Math.round(position.accuracy),
        });

        spot = response.data.data;
      }

      set({ currentSpot: spot, isSaving: false });
      return spot;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save spot';
      set({ error: message, isSaving: false });
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
}));
