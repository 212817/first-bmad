// apps/web/src/stores/__tests__/authStore.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { useAuthStore } from '../authStore';
import type { CurrentUser } from '../types';

describe('authStore', () => {
  const mockUser: CurrentUser = {
    id: 'user-123',
    email: 'test@example.com',
    displayName: 'Test User',
    avatarUrl: 'https://example.com/avatar.jpg',
  };

  beforeEach(() => {
    // Reset store to initial state before each test
    useAuthStore.getState().reset();
  });

  describe('initial state', () => {
    it('should have null user initially', () => {
      const state = useAuthStore.getState();
      expect(state.user).toBeNull();
    });

    it('should not be authenticated initially', () => {
      const state = useAuthStore.getState();
      expect(state.isAuthenticated).toBe(false);
    });

    it('should not be loading initially', () => {
      const state = useAuthStore.getState();
      expect(state.isLoading).toBe(false);
    });

    it('should have no error initially', () => {
      const state = useAuthStore.getState();
      expect(state.error).toBeNull();
    });
  });

  describe('setUser', () => {
    it('should set user and authenticate', () => {
      useAuthStore.getState().setUser(mockUser);
      const state = useAuthStore.getState();

      expect(state.user).toEqual(mockUser);
      expect(state.isAuthenticated).toBe(true);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should clear user when set to null', () => {
      // First set a user
      useAuthStore.getState().setUser(mockUser);
      // Then clear it
      useAuthStore.getState().setUser(null);
      const state = useAuthStore.getState();

      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('should clear loading state when setting user', () => {
      useAuthStore.getState().setLoading(true);
      useAuthStore.getState().setUser(mockUser);
      const state = useAuthStore.getState();

      expect(state.isLoading).toBe(false);
    });

    it('should clear error when setting user', () => {
      useAuthStore.getState().setError('Some error');
      useAuthStore.getState().setUser(mockUser);
      const state = useAuthStore.getState();

      expect(state.error).toBeNull();
    });
  });

  describe('setLoading', () => {
    it('should set loading to true', () => {
      useAuthStore.getState().setLoading(true);
      expect(useAuthStore.getState().isLoading).toBe(true);
    });

    it('should set loading to false', () => {
      useAuthStore.getState().setLoading(true);
      useAuthStore.getState().setLoading(false);
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('setError', () => {
    it('should set error message', () => {
      useAuthStore.getState().setError('Authentication failed');
      const state = useAuthStore.getState();

      expect(state.error).toBe('Authentication failed');
      expect(state.isLoading).toBe(false);
    });

    it('should clear error when set to null', () => {
      useAuthStore.getState().setError('Some error');
      useAuthStore.getState().setError(null);
      expect(useAuthStore.getState().error).toBeNull();
    });

    it('should clear loading when setting error', () => {
      useAuthStore.getState().setLoading(true);
      useAuthStore.getState().setError('Error occurred');
      expect(useAuthStore.getState().isLoading).toBe(false);
    });
  });

  describe('logout', () => {
    it('should clear user on logout', () => {
      useAuthStore.getState().setUser(mockUser);
      useAuthStore.getState().logout();
      const state = useAuthStore.getState();

      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
    });

    it('should clear all state on logout', () => {
      useAuthStore.getState().setUser(mockUser);
      useAuthStore.getState().setLoading(true);
      useAuthStore.getState().setError('Some error');
      useAuthStore.getState().logout();
      const state = useAuthStore.getState();

      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('reset', () => {
    it('should reset to initial state', () => {
      useAuthStore.getState().setUser(mockUser);
      useAuthStore.getState().setLoading(true);
      useAuthStore.getState().setError('Error');
      useAuthStore.getState().reset();
      const state = useAuthStore.getState();

      expect(state.user).toBeNull();
      expect(state.isAuthenticated).toBe(false);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('setAuthMode', () => {
    it('should set authMode to guest and mark as authenticated', () => {
      useAuthStore.getState().setAuthMode('guest');
      const state = useAuthStore.getState();

      expect(state.authMode).toBe('guest');
      expect(state.isAuthenticated).toBe(true);
    });

    it('should set authMode to authenticated and mark as authenticated', () => {
      useAuthStore.getState().setAuthMode('authenticated');
      const state = useAuthStore.getState();

      expect(state.authMode).toBe('authenticated');
      expect(state.isAuthenticated).toBe(true);
    });

    it('should set authMode to none and mark as not authenticated', () => {
      useAuthStore.getState().setAuthMode('guest');
      useAuthStore.getState().setAuthMode('none');
      const state = useAuthStore.getState();

      expect(state.authMode).toBe('none');
      expect(state.isAuthenticated).toBe(false);
    });

    it('should preserve user when changing authMode', () => {
      useAuthStore.getState().setUser(mockUser);
      useAuthStore.getState().setAuthMode('guest');
      const state = useAuthStore.getState();

      expect(state.user).toEqual(mockUser);
      expect(state.authMode).toBe('guest');
    });
  });
});
