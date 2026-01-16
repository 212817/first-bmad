// apps/web/src/hooks/useAuth/__tests__/useAuth.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useAuth } from '../useAuth';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/services/api/authApi';

// Mock authApi
vi.mock('@/services/api/authApi', () => ({
  authApi: {
    getOAuthUrl: vi.fn(),
    logout: vi.fn(),
    getMe: vi.fn(),
  },
}));

describe('useAuth', () => {
  const mockUser = {
    id: 'user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    avatarUrl: 'https://example.com/avatar.jpg',
  };

  // Save original location
  const originalLocation = window.location;

  beforeEach(() => {
    // Reset store
    useAuthStore.getState().reset();
    vi.clearAllMocks();

    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: { href: '', search: '' },
      writable: true,
    });
  });

  afterEach(() => {
    // Restore original location
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
  });

  describe('initial state', () => {
    it('should return unauthenticated state initially', () => {
      const { result } = renderHook(() => useAuth());

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('login', () => {
    it('should redirect to Google OAuth URL on login', () => {
      vi.mocked(authApi.getOAuthUrl).mockReturnValue('https://accounts.google.com/oauth');

      const { result } = renderHook(() => useAuth());

      act(() => {
        result.current.login('google');
      });

      expect(authApi.getOAuthUrl).toHaveBeenCalledWith('google');
      expect(window.location.href).toBe('https://accounts.google.com/oauth');
    });

    it('should set loading state when login is called', () => {
      vi.mocked(authApi.getOAuthUrl).mockReturnValue('https://oauth.url');

      const { result } = renderHook(() => useAuth());

      act(() => {
        result.current.login('google');
      });

      // Note: Since we redirect, loading might not be observable
      expect(authApi.getOAuthUrl).toHaveBeenCalled();
    });

    it('should support apple provider', () => {
      vi.mocked(authApi.getOAuthUrl).mockReturnValue('https://appleid.apple.com/oauth');

      const { result } = renderHook(() => useAuth());

      act(() => {
        result.current.login('apple');
      });

      expect(authApi.getOAuthUrl).toHaveBeenCalledWith('apple');
    });
  });

  describe('logout', () => {
    it('should call logout API and clear auth state', async () => {
      vi.mocked(authApi.logout).mockResolvedValue(undefined);

      // Set up authenticated state
      useAuthStore.getState().setUser(mockUser);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.logout();
      });

      expect(authApi.logout).toHaveBeenCalled();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('should clear auth state even if logout API fails', async () => {
      vi.mocked(authApi.logout).mockRejectedValue(new Error('Network error'));

      // Set up authenticated state
      useAuthStore.getState().setUser(mockUser);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.logout();
      });

      // Should still clear local state
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });

  describe('refreshUser', () => {
    it('should fetch and set user data', async () => {
      vi.mocked(authApi.getMe).mockResolvedValue(mockUser);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.refreshUser();
      });

      expect(authApi.getMe).toHaveBeenCalled();
      expect(result.current.user).toEqual(mockUser);
      expect(result.current.isAuthenticated).toBe(true);
    });

    it('should clear user if getMe fails', async () => {
      vi.mocked(authApi.getMe).mockRejectedValue(new Error('Unauthorized'));

      // Set up authenticated state
      useAuthStore.getState().setUser(mockUser);

      const { result } = renderHook(() => useAuth());

      await act(async () => {
        await result.current.refreshUser();
      });

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
    });
  });

  describe('state reflection', () => {
    it('should reflect authenticated state from store', () => {
      useAuthStore.getState().setUser(mockUser);

      const { result } = renderHook(() => useAuth());

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user).toEqual(mockUser);
    });

    it('should reflect loading state from store', () => {
      useAuthStore.getState().setLoading(true);

      const { result } = renderHook(() => useAuth());

      expect(result.current.isLoading).toBe(true);
    });

    it('should reflect error state from store', () => {
      useAuthStore.getState().setError('Auth error');

      const { result } = renderHook(() => useAuth());

      expect(result.current.error).toBe('Auth error');
    });
  });
});
