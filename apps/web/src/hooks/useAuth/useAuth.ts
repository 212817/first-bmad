// apps/web/src/hooks/useAuth/useAuth.ts
import { useAuthStore } from '@/stores/authStore';
import { useGuestStore } from '@/stores/guestStore';
import { authApi } from '@/services/api/authApi';
import type { UseAuthReturn } from './types';

/**
 * Auth hook - provides authentication functionality
 */
export const useAuth = (): UseAuthReturn => {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    setUser,
    setLoading,
    setLoggingOut,
    logout: clearAuth,
  } = useAuthStore();

  const { exitGuestMode } = useGuestStore();

  /**
   * Initiate OAuth login flow
   */
  const login = async (provider: 'google' | 'apple'): Promise<void> => {
    setLoading(true);
    // Clear guest mode before OAuth redirect so user comes back as non-guest
    const currentIsGuest = useGuestStore.getState().isGuest;
    if (currentIsGuest) {
      await exitGuestMode();
    }
    // Redirect to OAuth provider
    window.location.href = authApi.getOAuthUrl(provider);
  };

  /**
   * Logout and clear session
   */
  const logout = async (): Promise<void> => {
    try {
      setLoggingOut(true);
      await authApi.logout();
      clearAuth();
    } catch (err) {
      console.error('Logout failed:', err);
      // Clear local state anyway
      clearAuth();
    }
  };

  /**
   * Refresh current user data
   */
  const refreshUser = async (): Promise<void> => {
    try {
      setLoading(true);
      const userData = await authApi.getMe();
      // Clear guest mode when real user signs in
      // Get current isGuest state directly to avoid stale closure
      const currentIsGuest = useGuestStore.getState().isGuest;
      if (userData && currentIsGuest) {
        await exitGuestMode();
      }
      setUser(userData);
    } catch {
      // User not authenticated or session expired
      setUser(null);
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    refreshUser,
  };
};
