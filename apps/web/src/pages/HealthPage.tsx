import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { checkHealth } from '@/services/api/client';

interface HealthStatus {
  api: string;
  database: string;
  timestamp: string;
}

/**
 * Health status page - accessible via /health URL only
 * Shows API and database connection status
 */
export const HealthPage = () => {
  const [health, setHealth] = useState<HealthStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

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

  const handleRefresh = () => {
    setLoading(true);
    setError(null);
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
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">System Health</h1>

        {loading && (
          <div className="flex items-center justify-center gap-2 text-gray-500 py-4">
            <div className="animate-spin h-5 w-5 border-2 border-indigo-500 border-t-transparent rounded-full" />
            <span>Checking connection...</span>
          </div>
        )}

        {error && <div className="text-red-600 bg-red-50 p-3 rounded-md mb-4">{error}</div>}

        {health && (
          <div className="space-y-3 text-left">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">API:</span>
              <span className={health.api === 'ok' ? 'text-green-600 font-medium' : 'text-red-600'}>
                {health.api}
              </span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-gray-600">Database:</span>
              <span
                className={
                  health.database === 'ok' ? 'text-green-600 font-medium' : 'text-yellow-600'
                }
              >
                {health.database}
              </span>
            </div>
            <div className="flex justify-between py-2 text-sm">
              <span className="text-gray-500">Last checked:</span>
              <span className="text-gray-500">
                {new Date(health.timestamp).toLocaleTimeString()}
              </span>
            </div>
          </div>
        )}

        <div className="mt-6 flex gap-3">
          <button
            onClick={handleRefresh}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-md transition-colors"
          >
            Refresh
          </button>
          <Link
            to="/"
            className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors text-center"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};
