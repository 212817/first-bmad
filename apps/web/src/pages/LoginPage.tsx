// apps/web/src/pages/LoginPage.tsx
import { useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth/useAuth';
import { LoginButton } from '@/components/auth/LoginButton';

/**
 * Login page component
 */
export const LoginPage = () => {
  const { login, isLoading, error, isAuthenticated } = useAuth();

  // Get error from URL query params (set by OAuth callback)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlError = params.get('error');
    if (urlError) {
      // Could set error to store here if needed
      console.error('OAuth error:', urlError);
    }
  }, []);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      window.location.href = '/';
    }
  }, [isAuthenticated]);

  const handleGoogleLogin = () => {
    login('google');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-900 mb-2">Where Did I Park?</h1>
          <p className="text-gray-600">Sign in to sync your parking spots across devices</p>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-6 text-center">Sign In</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <LoginButton provider="google" onClick={handleGoogleLogin} loading={isLoading} />
          </div>

          <p className="mt-6 text-center text-sm text-gray-500">
            By signing in, you agree to our Terms of Service and Privacy Policy
          </p>
        </div>
      </div>
    </div>
  );
};
