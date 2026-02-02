// apps/web/src/components/layout/__tests__/ProfileMenu.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ProfileMenu } from '../ProfileMenu';
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/services/api/authApi';

// Mock authApi
vi.mock('@/services/api/authApi', () => ({
  authApi: {
    getOAuthUrl: vi.fn(),
    logout: vi.fn().mockResolvedValue(undefined),
    getMe: vi.fn(),
  },
}));

// Mock navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('ProfileMenu', () => {
  beforeEach(() => {
    useAuthStore.getState().reset();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderWithRouter = (component: React.ReactNode) => {
    return render(<MemoryRouter>{component}</MemoryRouter>);
  };

  describe('when not authenticated and not guest', () => {
    it('should not render anything', () => {
      const { container } = renderWithRouter(<ProfileMenu />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('when authenticated', () => {
    beforeEach(() => {
      useAuthStore.getState().setUser({
        id: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User',
        avatarUrl: null,
      });
    });

    it('should render user initials', () => {
      renderWithRouter(<ProfileMenu />);
      expect(screen.getByText('TU')).toBeInTheDocument();
    });

    it('should render user name on desktop', () => {
      renderWithRouter(<ProfileMenu />);
      expect(screen.getByText('Test User')).toBeInTheDocument();
    });

    it('should open dropdown menu when clicked', () => {
      renderWithRouter(<ProfileMenu />);
      const button = screen.getByRole('button', { name: /profile menu/i });
      fireEvent.click(button);

      expect(screen.getByRole('menu')).toBeInTheDocument();
      expect(screen.getByText('test@example.com')).toBeInTheDocument();
    });

    it('should show Sign Out button in menu', () => {
      renderWithRouter(<ProfileMenu />);
      fireEvent.click(screen.getByRole('button', { name: /profile menu/i }));

      expect(screen.getByRole('menuitem', { name: /sign out/i })).toBeInTheDocument();
    });

    it('should call logout and navigate on sign out', async () => {
      renderWithRouter(<ProfileMenu />);
      fireEvent.click(screen.getByRole('button', { name: /profile menu/i }));
      fireEvent.click(screen.getByRole('menuitem', { name: /sign out/i }));

      await waitFor(() => {
        expect(authApi.logout).toHaveBeenCalled();
        expect(mockNavigate).toHaveBeenCalledWith('/login', { replace: true });
      });
    });

    it('should close menu when Escape is pressed', () => {
      renderWithRouter(<ProfileMenu />);
      fireEvent.click(screen.getByRole('button', { name: /profile menu/i }));

      expect(screen.getByRole('menu')).toBeInTheDocument();

      fireEvent.keyDown(document, { key: 'Escape' });

      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });

    it('should display avatar when avatarUrl is provided', () => {
      useAuthStore.getState().setUser({
        id: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User',
        avatarUrl: 'https://example.com/avatar.jpg',
      });

      renderWithRouter(<ProfileMenu />);
      const avatar = screen.getByRole('img');
      expect(avatar).toHaveAttribute('src', 'https://example.com/avatar.jpg');
    });
  });

  describe('when in guest mode', () => {
    beforeEach(() => {
      useAuthStore.getState().setAuthMode('guest');
    });

    it('should render Guest label', () => {
      renderWithRouter(<ProfileMenu />);
      expect(screen.getByText('Guest')).toBeInTheDocument();
    });

    it('should render G initial for guest', () => {
      renderWithRouter(<ProfileMenu />);
      expect(screen.getByText('G')).toBeInTheDocument();
    });

    it('should open dropdown with guest info', () => {
      renderWithRouter(<ProfileMenu />);
      fireEvent.click(screen.getByRole('button', { name: /profile menu/i }));

      expect(screen.getByText('Guest Mode')).toBeInTheDocument();
      expect(screen.getByText('Data stored locally')).toBeInTheDocument();
    });

    it('should show Sign In button instead of Sign Out', () => {
      renderWithRouter(<ProfileMenu />);
      fireEvent.click(screen.getByRole('button', { name: /profile menu/i }));

      expect(screen.getByRole('menuitem', { name: /sign in/i })).toBeInTheDocument();
      expect(screen.queryByRole('menuitem', { name: /sign out/i })).not.toBeInTheDocument();
    });

    it('should navigate to login when Sign In is clicked', () => {
      renderWithRouter(<ProfileMenu />);
      fireEvent.click(screen.getByRole('button', { name: /profile menu/i }));
      fireEvent.click(screen.getByRole('menuitem', { name: /sign in/i }));

      expect(mockNavigate).toHaveBeenCalledWith('/login');
    });
  });

  describe('getInitials helper', () => {
    it('should return first letter of email when no displayName', () => {
      useAuthStore.getState().setUser({
        id: 'user-123',
        email: 'alice@example.com',
        displayName: null,
        avatarUrl: null,
      });

      renderWithRouter(<ProfileMenu />);
      expect(screen.getByText('A')).toBeInTheDocument();
    });

    it('should handle single-word displayName', () => {
      useAuthStore.getState().setUser({
        id: 'user-123',
        email: 'test@example.com',
        displayName: 'Alice',
        avatarUrl: null,
      });

      renderWithRouter(<ProfileMenu />);
      expect(screen.getByText('A')).toBeInTheDocument();
    });

    it('should handle three-word displayName (max 2 chars)', () => {
      useAuthStore.getState().setUser({
        id: 'user-123',
        email: 'test@example.com',
        displayName: 'Alice Bob Carol',
        avatarUrl: null,
      });

      renderWithRouter(<ProfileMenu />);
      expect(screen.getByText('AB')).toBeInTheDocument();
    });
  });
});
