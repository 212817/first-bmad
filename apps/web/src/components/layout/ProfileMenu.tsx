// apps/web/src/components/layout/ProfileMenu.tsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth/useAuth';
import { useAuthStore } from '@/stores/authStore';

/**
 * ProfileMenu component - displays user avatar and dropdown menu
 * Shows "Sign In" for guests, "Sign Out" for authenticated users
 */
export const ProfileMenu = () => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const { user, logout, isLoading } = useAuth();
  const { authMode, isLoggingOut } = useAuthStore();

  const isGuest = authMode === 'guest';
  const isAuthenticated = authMode === 'authenticated';

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Close menu on Escape key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen]);

  /**
   * Handle sign out click
   */
  const handleSignOut = async () => {
    setIsOpen(false);
    await logout();
    navigate('/login', { replace: true });
  };

  /**
   * Handle sign in click for guests
   */
  const handleSignIn = () => {
    setIsOpen(false);
    navigate('/login');
  };

  /**
   * Get user initials for avatar fallback
   */
  const getInitials = (): string => {
    if (user?.displayName) {
      const parts = user.displayName.split(' ').filter((n) => n.length > 0);
      const initials = parts.map((n) => n.charAt(0)).join('');
      return initials.toUpperCase().slice(0, 2);
    }
    if (user?.email && user.email.length > 0) {
      return user.email.charAt(0).toUpperCase();
    }
    return isGuest ? 'G' : '?';
  };

  // Don't render if no auth mode (not authenticated and not guest)
  if (!isAuthenticated && !isGuest) {
    return null;
  }

  return (
    <div className="relative" ref={menuRef}>
      {/* Profile button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
        aria-expanded={isOpen}
        aria-haspopup="true"
        aria-label="Profile menu"
        data-testid="profile-menu-button"
      >
        {/* Avatar */}
        {user?.avatarUrl ? (
          <img
            src={user.avatarUrl}
            alt={user.displayName ?? user.email}
            className="w-8 h-8 rounded-full"
          />
        ) : (
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
              isGuest ? 'bg-gray-400 text-white' : 'bg-indigo-500 text-white'
            }`}
          >
            {getInitials()}
          </div>
        )}

        {/* User name (hidden on mobile) */}
        <span className="hidden sm:block text-sm text-gray-700">
          {isGuest ? 'Guest' : (user?.displayName ?? user?.email ?? 'User')}
        </span>

        {/* Chevron icon */}
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-[60]"
          role="menu"
          aria-orientation="vertical"
        >
          {/* User info (for authenticated users only) */}
          {isAuthenticated && user && (
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user.displayName ?? 'User'}
              </p>
              <p className="text-xs text-gray-500 truncate">{user.email}</p>
            </div>
          )}

          {/* Guest info */}
          {isGuest && (
            <div className="px-4 py-2 border-b border-gray-100">
              <p className="text-sm font-medium text-gray-900">Guest Mode</p>
              <p className="text-xs text-gray-500">Data stored locally</p>
            </div>
          )}

          {/* Sign In button for guests */}
          {isGuest && (
            <button
              type="button"
              onClick={handleSignIn}
              className="w-full text-left px-4 py-2 text-sm text-indigo-600 hover:bg-gray-50 flex items-center gap-2"
              role="menuitem"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"
                />
              </svg>
              Sign In
            </button>
          )}

          {/* Sign Out button for authenticated users */}
          {isAuthenticated && (
            <button
              type="button"
              onClick={handleSignOut}
              disabled={isLoggingOut || isLoading}
              className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              role="menuitem"
            >
              {isLoggingOut ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  Signing out...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                    />
                  </svg>
                  Sign Out
                </>
              )}
            </button>
          )}
        </div>
      )}
    </div>
  );
};
