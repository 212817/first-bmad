// apps/web/src/stores/authStore.ts
import { create } from 'zustand';
import type { AuthStore, CurrentUser } from './types';

const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

/**
 * Auth store using Zustand
 * Manages user authentication state
 */
export const useAuthStore = create<AuthStore>((set) => ({
  ...initialState,

  setUser: (user: CurrentUser | null) =>
    set({
      user,
      isAuthenticated: user !== null,
      isLoading: false,
      error: null,
    }),

  setLoading: (isLoading: boolean) => set({ isLoading }),

  setError: (error: string | null) => set({ error, isLoading: false }),

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    }),

  reset: () => set(initialState),
}));
