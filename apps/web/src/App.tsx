import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { HealthPage } from '@/pages/HealthPage';
import { SpotConfirmationPage } from '@/pages/SpotConfirmationPage';
import { ManualEntryPage } from '@/pages/ManualEntryPage';
import { HistoryPage } from '@/pages/HistoryPage';
import { useGuestStore } from '@/stores/guestStore';
import { useAuthStore } from '@/stores/authStore';

/**
 * Extract tokens from URL hash (Safari/iOS workaround for cross-origin cookies)
 * Returns tokens and cleans up the URL
 */
const extractTokensFromHash = (): { accessToken?: string; refreshToken?: string } | null => {
  const hash = window.location.hash;
  if (!hash || !hash.includes('access_token')) return null;

  const params = new URLSearchParams(hash.slice(1)); // Remove leading #
  const accessToken = params.get('access_token') || undefined;
  const refreshToken = params.get('refresh_token') || undefined;

  // Clean up URL (remove hash)
  if (accessToken) {
    window.history.replaceState(null, '', window.location.pathname);
  }

  return accessToken ? { accessToken, refreshToken } : null;
};

const App = () => {
  const { hydrate, isGuest, exitGuestMode } = useGuestStore();
  const { setAuthMode, authMode } = useAuthStore();
  const [appReady, setAppReady] = useState(false);

  // Hydrate guest session and sync to auth store on app load
  useEffect(() => {
    const initApp = async () => {
      // Check for tokens in URL hash (Safari/iOS workaround)
      const hashTokens = extractTokensFromHash();
      if (hashTokens?.accessToken) {
        // Store tokens in localStorage for Safari/iOS where cookies don't work
        localStorage.setItem('accessToken', hashTokens.accessToken);
        if (hashTokens.refreshToken) {
          localStorage.setItem('refreshToken', hashTokens.refreshToken);
        }
      }

      await hydrate();
      // Sync guest state to auth store immediately after hydration
      const guestState = useGuestStore.getState();
      if (guestState.isGuest) {
        setAuthMode('guest');
      }
      setAppReady(true);
    };
    initApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Clear guest data when user becomes authenticated
  useEffect(() => {
    if (authMode === 'authenticated' && isGuest) {
      exitGuestMode();
    }
  }, [authMode, isGuest, exitGuestMode]);

  // Show loading until hydrated
  if (!appReady) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/health" element={<HealthPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/spots/manual" element={<ManualEntryPage />} />
        <Route path="/spot/:spotId/confirm" element={<SpotConfirmationPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
