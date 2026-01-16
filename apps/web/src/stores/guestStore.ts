// apps/web/src/stores/guestStore.ts
import { create } from 'zustand';
import { indexedDbService } from '@/services/storage/indexedDb.service';
import { STORES, type GuestSessionData } from '@/services/storage/types';

/**
 * Guest state
 */
interface GuestState {
  isGuest: boolean;
  guestSessionId: string | null;
  createdAt: number | null;
  isHydrated: boolean;
}

/**
 * Guest actions
 */
interface GuestActions {
  enterGuestMode: () => Promise<void>;
  exitGuestMode: () => Promise<void>;
  hydrate: () => Promise<void>;
}

/**
 * Complete guest store type
 */
export type GuestStore = GuestState & GuestActions;

const initialState: GuestState = {
  isGuest: false,
  guestSessionId: null,
  createdAt: null,
  isHydrated: false,
};

/**
 * Guest store using Zustand
 * Manages guest session state with IndexedDB persistence
 */
export const useGuestStore = create<GuestStore>((set) => ({
  ...initialState,

  /**
   * Enter guest mode - creates a new guest session
   */
  enterGuestMode: async () => {
    const sessionId = crypto.randomUUID();
    const createdAt = Date.now();

    const sessionData: GuestSessionData = {
      isGuest: true,
      guestSessionId: sessionId,
      createdAt,
    };

    // Persist to IndexedDB
    await indexedDbService.setItem(STORES.guestSession, 'current', sessionData);

    set({
      isGuest: true,
      guestSessionId: sessionId,
      createdAt,
      isHydrated: true,
    });
  },

  /**
   * Exit guest mode - clears guest session
   */
  exitGuestMode: async () => {
    // Remove from IndexedDB
    await indexedDbService.deleteItem(STORES.guestSession, 'current');

    set({
      isGuest: false,
      guestSessionId: null,
      createdAt: null,
    });
  },

  /**
   * Hydrate guest state from IndexedDB on app load
   */
  hydrate: async () => {
    try {
      // Ensure IndexedDB is initialized
      await indexedDbService.init();

      const session = await indexedDbService.getItem<GuestSessionData>(
        STORES.guestSession,
        'current'
      );

      if (session?.isGuest) {
        set({
          isGuest: true,
          guestSessionId: session.guestSessionId,
          createdAt: session.createdAt,
          isHydrated: true,
        });
      } else {
        set({ isHydrated: true });
      }
    } catch (error) {
      // If IndexedDB fails, just mark as hydrated with no guest session
      console.warn('Failed to hydrate guest session:', error);
      set({ isHydrated: true });
    }
  },
}));
