// apps/web/src/stores/types.ts

/**
 * Current user info stored in state
 */
export interface CurrentUser {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
}

/**
 * Authentication mode
 */
export type AuthMode = 'authenticated' | 'guest' | 'none';

/**
 * Auth state interface
 */
export interface AuthState {
  user: CurrentUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isLoggingOut: boolean;
  error: string | null;
  authMode: AuthMode;
}

/**
 * Auth store actions
 */
export interface AuthActions {
  setUser: (user: CurrentUser | null) => void;
  setLoading: (loading: boolean) => void;
  setLoggingOut: (loggingOut: boolean) => void;
  setError: (error: string | null) => void;
  setAuthMode: (mode: AuthMode) => void;
  logout: () => void;
  reset: () => void;
}

/**
 * Complete auth store type
 */
export type AuthStore = AuthState & AuthActions;
