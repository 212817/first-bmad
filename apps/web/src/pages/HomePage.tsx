import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { checkHealth } from '@/services/api/client';
import { useAuth } from '@/hooks/useAuth/useAuth';

interface HealthStatus {
  api: string;
  database: string;
  timestamp: string;
}

/**
 * Get initials from display name or email
 */
const getInitials = (displayName: string | null, email: string): string => {
  if (displayName) {
    const parts = displayName.trim().split(/\s+/);
    const first = parts[0];
    const last = parts[parts.length - 1];
    if (parts.length >= 2 && first && last) {
      return (first.charAt(0) + last.charAt(0)).toUpperCase();
    }
    return displayName.slice(0, 2).toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
};

/**
 * Avatar component with fallback to initials
 */
const UserAvatar = ({
  avatarUrl,
  displayName,
  email,
}: {
  avatarUrl: string | null;
  displayName: string | null;
  email: string;
}) => {
  const [imgError, setImgError] = useState(false);
  const initials = getInitials(displayName, email);

  if (avatarUrl && !imgError) {
    return (
      <img
        src={avatarUrl}
        alt={displayName ?? 'User'}
        className="w-10 h-10 rounded-full"
        onError={() => setImgError(true)}
      />
    );
  }

  return (
    <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-medium text-sm">
      {initials}
    </div>
  );
};

export const HomePage = () => {
  const { user, isAuthenticated, isLoading: authLoading, logout, refreshUser } = useAuth();
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Check auth status on mount
  useEffect(() => {
    refreshUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const fetchHealth = async () => {
      try {
        const data = await checkHealth();
        setHealth(data);
        setError(null);
      } catch (err) {
        setError('Could not connect to API');
        console.error('Health check failed:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchHealth();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <main className="text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-indigo-900 mb-4">Where Did I Park?</h1>
        <p className="text-lg text-gray-600 mb-8">Never forget where you parked again</p>

        {/* Auth Status */}
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Account</h2>
          {authLoading ? (
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <div className="animate-spin h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full" />
              <span>Loading...</span>
            </div>
          ) : isAuthenticated && user ? (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <UserAvatar
                  avatarUrl={user.avatarUrl}
                  displayName={user.displayName}
                  email={user.email}
                />
                <div className="text-left">
                  <p className="font-medium text-gray-800">{user.displayName ?? 'User'}</p>
                  <p className="text-sm text-gray-500">{user.email}</p>
                </div>
              </div>
              <button
                onClick={logout}
                className="w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors"
              >
                Sign Out
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-gray-600">Sign in to save your parking spots</p>
              <Link
                to="/login"
                className="inline-block px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg transition-colors"
              >
                Sign In
              </Link>
            </div>
          )}
        </div>

        {/* API Status */}
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md mx-auto">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">API Status</h2>

          {loading && (
            <div className="flex items-center justify-center gap-2 text-gray-500">
              <div className="animate-spin h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full" />
              <span>Checking connection...</span>
            </div>
          )}

          {error && <div className="text-red-600 bg-red-50 p-3 rounded-md">{error}</div>}

          {health && (
            <div className="space-y-2 text-left">
              <div className="flex justify-between">
                <span className="text-gray-600">API:</span>
                <span
                  className={health.api === 'ok' ? 'text-green-600 font-medium' : 'text-red-600'}
                >
                  {health.api}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Database:</span>
                <span
                  className={
                    health.database === 'ok' ? 'text-green-600 font-medium' : 'text-yellow-600'
                  }
                >
                  {health.database}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Last checked:</span>
                <span className="text-gray-500">
                  {new Date(health.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
