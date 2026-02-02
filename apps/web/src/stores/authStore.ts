// apps/web/src/stores/authStore.ts
import { create } from 'zustand';
import type { AuthStore, AuthMode, CurrentUser } from './types';

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isLoggingOut: false,
  error: null,
  authMode: 'none' as AuthMode,
};

/**
 * Auth store using Zustand
 * Manages user authentication state
 */
export const useAuthStore = create<AuthStore>((set) => ({
  ...initialState,

  setUser: (user: CurrentUser | null) =>
    set((state) => ({
      user,
      isAuthenticated: user !== null || state.authMode === 'guest',
      isLoading: false,
      error: null,
      // Only change authMode if we're setting a user, otherwise keep current mode (for guest)
      authMode: user !== null ? 'authenticated' : state.authMode === 'guest' ? 'guest' : 'none',
    })),

  setLoading: (isLoading: boolean) => set({ isLoading }),

  setLoggingOut: (isLoggingOut: boolean) => set({ isLoggingOut }),

  setError: (error: string | null) => set({ error, isLoading: false }),

  setAuthMode: (authMode: AuthMode) =>
    set({
      authMode,
      isAuthenticated: authMode === 'authenticated' || authMode === 'guest',
    }),

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isLoggingOut: false,
      error: null,
      authMode: 'none',
    }),

  reset: () => set(initialState),
}));
