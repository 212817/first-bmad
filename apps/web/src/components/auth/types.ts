// apps/web/src/components/auth/types.ts

/**
 * Auth provider types
 */
export type AuthProvider = 'google' | 'apple';

/**
 * Login button props
 */
export interface LoginButtonProps {
  provider: AuthProvider;
  onClick?: () => void;
  loading?: boolean;
  disabled?: boolean;
}

/**
 * Auth guard props
 */
export interface AuthGuardProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Auth error state
 */
export interface AuthError {
  code: string;
  message: string;
}
