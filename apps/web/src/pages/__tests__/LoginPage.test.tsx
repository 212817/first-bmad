// apps/web/src/pages/__tests__/LoginPage.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LoginPage } from '../LoginPage';
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

describe('LoginPage', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    useAuthStore.getState().reset();
    vi.clearAllMocks();

    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: { href: '', search: '' },
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
  });

  describe('rendering', () => {
    it('should render the login page title', () => {
      render(<LoginPage />);

      expect(screen.getByText('Where Did I Park?')).toBeInTheDocument();
    });

    it('should render the subtitle', () => {
      render(<LoginPage />);

      expect(
        screen.getByText('Sign in to sync your parking spots across devices')
      ).toBeInTheDocument();
    });

    it('should render Google sign-in button', () => {
      render(<LoginPage />);

      expect(screen.getByRole('button', { name: /google/i })).toBeInTheDocument();
    });

    it('should render terms text', () => {
      render(<LoginPage />);

      expect(
        screen.getByText(/by signing in, you agree to our terms of service/i)
      ).toBeInTheDocument();
    });
  });

  describe('Google login', () => {
    it('should redirect to Google OAuth when button is clicked', () => {
      vi.mocked(authApi.getOAuthUrl).mockReturnValue('https://accounts.google.com/oauth');

      render(<LoginPage />);

      const googleButton = screen.getByRole('button', { name: /google/i });
      fireEvent.click(googleButton);

      expect(authApi.getOAuthUrl).toHaveBeenCalledWith('google');
      expect(window.location.href).toBe('https://accounts.google.com/oauth');
    });
  });

  describe('loading state', () => {
    it('should show loading indicator when loading', () => {
      useAuthStore.getState().setLoading(true);

      render(<LoginPage />);

      // Check for loading spinner or disabled button
      const googleButton = screen.getByRole('button', { name: /google/i });
      expect(googleButton).toBeDisabled();
    });
  });

  describe('error handling', () => {
    it('should display error message when error exists', () => {
      useAuthStore.getState().setError('Authentication failed');

      render(<LoginPage />);

      expect(screen.getByText('Authentication failed')).toBeInTheDocument();
    });

    it('should handle OAuth error from URL params', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      window.location.search = '?error=access_denied';

      render(<LoginPage />);

      expect(consoleSpy).toHaveBeenCalledWith('OAuth error:', 'access_denied');
      consoleSpy.mockRestore();
    });
  });

  describe('redirect on authenticated', () => {
    it('should redirect to home when already authenticated', () => {
      useAuthStore.getState().setUser({
        id: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User',
        avatarUrl: null,
      });

      render(<LoginPage />);

      expect(window.location.href).toBe('/');
    });
  });
});
