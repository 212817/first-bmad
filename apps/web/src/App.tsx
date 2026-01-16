import { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { useGuestStore } from '@/stores/guestStore';
import { useAuthStore } from '@/stores/authStore';

const App = () => {
  const { hydrate, isGuest, isHydrated, exitGuestMode } = useGuestStore();
  const { setAuthMode, authMode } = useAuthStore();
  const [appReady, setAppReady] = useState(false);

  // Hydrate guest session on app load
  useEffect(() => {
    const initApp = async () => {
      await hydrate();
      setAppReady(true);
    };
    initApp();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync guest state to auth store
  useEffect(() => {
    if (isHydrated && isGuest) {
      setAuthMode('guest');
    }
  }, [isHydrated, isGuest, setAuthMode]);

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
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
