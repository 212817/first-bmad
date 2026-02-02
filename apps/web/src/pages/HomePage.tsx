import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth/useAuth';
import { useGuestStore } from '@/stores/guestStore';
import { useAuthStore } from '@/stores/authStore';
import { useSpotStore } from '@/stores/spotStore';
import { useGeolocation } from '@/hooks/useGeolocation/useGeolocation';
import { GuestModeBanner } from '@/components/ui/GuestModeBanner';
import { SignInPrompt } from '@/components/prompts/SignInPrompt';
import { LocationPermissionPrompt } from '@/components/prompts/LocationPermissionPrompt';
import { useSignInPrompt } from '@/hooks/useSignInPrompt/useSignInPrompt';
import { Header } from '@/components/layout/Header';

export const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, refreshUser } = useAuth();
  const { isGuest } = useGuestStore();
  const { authMode } = useAuthStore();
  const { showPrompt, dismiss } = useSignInPrompt();
  const { saveSpot, isSaving, error: spotError, setError: setSpotError } = useSpotStore();
  const {
    getCurrentPosition,
    isLoading: locationLoading,
    permissionState,
    error: locationError,
  } = useGeolocation();

  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  // Check auth status on mount (only if not in guest mode)
  // When OAuth completes, authMode won't be 'guest' yet (it's set after hydration)
  // so refreshUser will be called and authenticate the user
  useEffect(() => {
    if (authMode !== 'guest') {
      refreshUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSignInFromPrompt = () => {
    window.location.href = '/login';
  };

  /**
   * Handle "Save my spot" button click
   * Shows permission prompt if needed, then captures location
   */
  const handleSaveSpotClick = () => {
    // Check if user is authenticated or in guest mode
    if (!isAuthenticated && !isGuest) {
      navigate('/login');
      return;
    }

    // Check permission state - show prompt if first time
    if (permissionState === 'prompt') {
      setShowLocationPrompt(true);
    } else if (permissionState === 'denied') {
      // Permission was denied - offer manual entry
      setShowLocationPrompt(true);
    } else {
      // Permission granted - capture location directly
      captureAndSaveLocation();
    }
  };

  /**
   * Capture location and save the spot
   */
  const captureAndSaveLocation = async () => {
    setIsCapturing(true);
    setShowLocationPrompt(false);
    setSpotError(null);

    try {
      const position = await getCurrentPosition();
      const spot = await saveSpot({
        lat: position.lat,
        lng: position.lng,
        accuracy: position.accuracy,
      });

      // Navigate to confirmation page
      navigate(`/spot/${spot.id}/confirm`);
    } catch (err) {
      console.error('Failed to save spot:', err);
      // Error is already set in the store or geolocation hook
    } finally {
      setIsCapturing(false);
    }
  };

  /**
   * Handle "Enable Location" from prompt
   */
  const handleEnableLocation = () => {
    captureAndSaveLocation();
  };

  /**
   * Handle "Enter Manually" from prompt
   */
  const handleEnterManually = () => {
    setShowLocationPrompt(false);
    // TODO: Story 2.6 will add manual entry
    navigate('/spots/manual');
  };

  const isBusy = isCapturing || isSaving || locationLoading;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header with ProfileMenu */}
      <Header />

      {/* Guest Mode Banner */}
      {authMode === 'guest' && <GuestModeBanner />}

      {/* Sign-In Prompt for Guest Users */}
      {showPrompt && <SignInPrompt onSignIn={handleSignInFromPrompt} onDismiss={dismiss} />}

      {/* Location Permission Prompt */}
      {showLocationPrompt && (
        <LocationPermissionPrompt
          onEnableLocation={handleEnableLocation}
          onEnterManually={handleEnterManually}
          isLoading={isBusy}
        />
      )}

      <main className="flex-1 flex flex-col items-center justify-center p-4 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-indigo-900 mb-4">Where Did I Park?</h1>
        <p className="text-lg text-gray-600 mb-8">Never forget where you parked again</p>

        {/* Save My Spot Button - Primary CTA */}
        <button
          onClick={handleSaveSpotClick}
          disabled={isBusy}
          className="mb-8 px-8 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xl font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:hover:scale-100 flex items-center gap-3 min-w-[200px] justify-center"
          data-testid="save-spot-button"
        >
          {isBusy ? (
            <>
              <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Saving...
            </>
          ) : (
            <>
              <span className="text-2xl">🚗</span>
              Save my spot
            </>
          )}
        </button>

        {/* Error Display */}
        {(spotError || locationError) && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg max-w-md">
            <p className="text-red-700">{spotError || locationError?.message}</p>
            <button
              onClick={() => setSpotError(null)}
              className="mt-2 text-sm text-red-600 hover:text-red-800 underline"
            >
              Dismiss
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
