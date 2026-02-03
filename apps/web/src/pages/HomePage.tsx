import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth/useAuth';
import { useGuestStore } from '@/stores/guestStore';
import { useAuthStore } from '@/stores/authStore';
import { useSpotStore } from '@/stores/spotStore';
import { useCarTagStore } from '@/stores/carTagStore';
import { useGeolocation } from '@/hooks/useGeolocation/useGeolocation';
import { GuestModeBanner } from '@/components/ui/GuestModeBanner';
import { SignInPrompt } from '@/components/prompts/SignInPrompt';
import { LocationPermissionPrompt } from '@/components/prompts/LocationPermissionPrompt';
import { useSignInPrompt } from '@/hooks/useSignInPrompt/useSignInPrompt';
import { Header } from '@/components/layout/Header';
import { LatestSpotCard } from '@/components/spot/LatestSpotCard';
import { geocodingApi } from '@/services/api/geocodingApi';

export const HomePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, refreshUser } = useAuth();
  const { isGuest } = useGuestStore();
  const { authMode } = useAuthStore();
  const { showPrompt, dismiss } = useSignInPrompt();
  const {
    saveSpot,
    isSaving,
    error: spotError,
    setError: setSpotError,
    latestSpot,
    isLoadingLatest,
    fetchLatestSpot,
  } = useSpotStore();
  const { fetchTags, getTagById } = useCarTagStore();
  const {
    getCurrentPosition,
    isLoading: locationLoading,
    permissionState,
    error: locationError,
  } = useGeolocation();

  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [address, setAddress] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const addressInputRef = useRef<HTMLInputElement>(null);

  // Check auth status on mount (only if not in guest mode)
  // When OAuth completes, authMode won't be 'guest' yet (it's set after hydration)
  // so refreshUser will be called and authenticate the user
  useEffect(() => {
    if (authMode !== 'guest') {
      refreshUser();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fetch latest spot and car tags on mount (when authenticated or in guest mode)
  useEffect(() => {
    if (isAuthenticated || isGuest) {
      fetchLatestSpot().catch(() => {
        // Error is handled in the store
      });
      fetchTags();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isGuest]);

  /**
   * Get car tag info for the latest spot
   */
  const getTagInfo = () => {
    if (!latestSpot?.carTagId) {
      return { name: null, color: undefined };
    }
    const tag = getTagById(latestSpot.carTagId);
    return tag ? { name: tag.name, color: tag.color } : { name: null, color: undefined };
  };

  /**
   * Handle navigation to the latest spot
   */
  const handleNavigateToSpot = () => {
    if (!latestSpot) return;

    // If we have coordinates, open in maps app
    if (latestSpot.lat !== null && latestSpot.lng !== null) {
      // Use platform-appropriate maps URL
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${latestSpot.lat},${latestSpot.lng}`;
      window.open(mapsUrl, '_blank');
    } else if (latestSpot.address) {
      // If only address, use address-based navigation
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(latestSpot.address)}`;
      window.open(mapsUrl, '_blank');
    }
  };

  const handleSignInFromPrompt = () => {
    window.location.href = '/login';
  };

  /**
   * Handle "Use my location" button click
   * Only shows modal if permission was denied, otherwise requests permission directly
   */
  const handleSaveSpotClick = () => {
    // Check if user is authenticated or in guest mode
    if (!isAuthenticated && !isGuest) {
      navigate('/login');
      return;
    }

    // Only show modal if permission was explicitly denied
    if (permissionState === 'denied') {
      setShowLocationPrompt(true);
    } else {
      // Permission granted or prompt - request location directly
      // Browser will show its own permission dialog if needed
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
    // Focus on address input
    addressInputRef.current?.focus();
  };

  /**
   * Handle address form submission
   */
  const handleAddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!address.trim()) return;

    // Check if user is authenticated or in guest mode
    if (!isAuthenticated && !isGuest) {
      navigate('/login');
      return;
    }

    setIsGeocoding(true);
    setGeocodeError(null);

    try {
      const result = await geocodingApi.geocodeAddress(address.trim());

      if (!result) {
        setGeocodeError('Address not found. Please try a different address.');
        return;
      }

      const spot = await saveSpot({
        lat: result.lat,
        lng: result.lng,
        accuracy: null, // Manual entry has no accuracy
      });

      navigate(`/spot/${spot.id}/confirm`);
    } catch (err) {
      console.error('Failed to geocode address:', err);
      setGeocodeError('Failed to find address. Please try again.');
    } finally {
      setIsGeocoding(false);
    }
  };

  const isBusy = isCapturing || isSaving || locationLoading;
  const isAddressBusy = isGeocoding || isSaving;

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

        {/* Latest Spot Card - shown when authenticated or in guest mode */}
        {(isAuthenticated || isGuest) && (
          <div className="w-full max-w-md mb-6">
            <LatestSpotCard
              spot={latestSpot}
              carTagName={getTagInfo().name}
              carTagColor={getTagInfo().color}
              onNavigate={handleNavigateToSpot}
              isLoading={isLoadingLatest}
            />
          </div>
        )}

        {/* Options Container */}
        <div className="w-full max-w-md space-y-6">
          {/* Option 1: Enable Location Button */}
          <button
            onClick={handleSaveSpotClick}
            disabled={isBusy}
            className="w-full px-8 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xl font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:hover:scale-100 flex items-center gap-3 justify-center"
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
                <span className="text-2xl">📍</span>
                Use my location
              </>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-300" />
            <span className="text-gray-500 font-medium">or</span>
            <div className="flex-1 h-px bg-gray-300" />
          </div>

          {/* Option 2: Enter Address */}
          <form onSubmit={handleAddressSubmit} className="space-y-3">
            <label htmlFor="address-input" className="block text-left text-gray-700 font-medium">
              Enter parking address
            </label>
            <input
              ref={addressInputRef}
              id="address-input"
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g., 123 Main St, City"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg"
              data-testid="address-input"
            />
            <button
              type="submit"
              disabled={!address.trim() || isAddressBusy}
              className="w-full px-6 py-3 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white text-lg font-semibold rounded-lg transition-colors flex items-center gap-2 justify-center"
              data-testid="save-address-button"
            >
              {isAddressBusy ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
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
                  <span>🚗</span>
                  Save spot
                </>
              )}
            </button>
          </form>
        </div>

        {/* Error Display */}
        {(spotError || locationError || geocodeError) && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg max-w-md">
            <p className="text-red-700">{spotError || locationError?.message || geocodeError}</p>
            <button
              onClick={() => {
                setSpotError(null);
                setGeocodeError(null);
              }}
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
