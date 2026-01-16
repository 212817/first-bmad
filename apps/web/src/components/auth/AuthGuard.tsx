// apps/web/src/components/auth/AuthGuard.tsx
import { useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/useAuth/useAuth';
import type { AuthGuardProps } from './types';

/**
 * AuthGuard component - protects routes requiring authentication
 * Redirects to login if not authenticated
 */
export const AuthGuard = ({ children, fallback }: AuthGuardProps) => {
  const { isAuthenticated, isLoading, refreshUser } = useAuth();
  const hasChecked = useRef(false);

  // Check auth state on mount
  useEffect(() => {
    if (!hasChecked.current) {
      hasChecked.current = true;
      refreshUser();
    }
  }, [refreshUser]);

  // Handle redirect in effect to avoid lint errors
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      window.location.href = '/login';
    }
  }, [isLoading, isAuthenticated]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      fallback ?? (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      )
    );
  }

  // Don't render children if not authenticated (redirect will happen in effect)
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};
