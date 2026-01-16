import { useEffect, useState } from 'react';
import { checkHealth } from '@/services/api/client';

interface HealthStatus {
  api: string;
  database: string;
  timestamp: string;
}

function App() {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-4">
      <main className="text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-indigo-900 mb-4">Where Did I Park?</h1>
        <p className="text-lg text-gray-600 mb-8">Never forget where you parked again</p>

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
}

export default App;
