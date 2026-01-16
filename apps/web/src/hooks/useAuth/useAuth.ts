// apps/web/src/hooks/useAuth/useAuth.ts
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/services/api/authApi';
import type { UseAuthReturn } from './types';

/**
 * Auth hook - provides authentication functionality
 */
export const useAuth = (): UseAuthReturn => {
  const { user, isAuthenticated, isLoading, error, setUser, setLoading, logout: clearAuth } = useAuthStore();

  /**
   * Initiate OAuth login flow
   */
  const login = (provider: 'google' | 'apple'): void => {
    setLoading(true);
    // Redirect to OAuth provider
    window.location.href = authApi.getOAuthUrl(provider);
  };

  /**
   * Logout and clear session
   */
  const logout = async (): Promise<void> => {
    try {
      setLoading(true);
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
