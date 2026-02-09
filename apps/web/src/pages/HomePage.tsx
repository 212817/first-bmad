import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth/useAuth';
import { SpotMap } from '@/components/map';
import { useGuestStore } from '@/stores/guestStore';
import { useAuthStore } from '@/stores/authStore';
import { useSpotStore } from '@/stores/spotStore';
import { useCarTagStore } from '@/stores/carTagStore';
import { useGeolocation } from '@/hooks/useGeolocation/useGeolocation';
import { useNavigation } from '@/hooks/useNavigation/useNavigation';
import { GuestModeBanner } from '@/components/ui/GuestModeBanner';
import { SignInPrompt } from '@/components/prompts/SignInPrompt';
import { LocationPermissionPrompt } from '@/components/prompts/LocationPermissionPrompt';
import { MapPickerModal } from '@/components/navigation';
import { useSignInPrompt } from '@/hooks/useSignInPrompt/useSignInPrompt';
import { useReverseGeocode } from '@/hooks/useReverseGeocode/useReverseGeocode';
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
  const { openPicker, closePicker, isPickerOpen, pendingSpot, navigateToSpot } = useNavigation();

  const [showLocationPrompt, setShowLocationPrompt] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [userRequestedLocation, setUserRequestedLocation] = useState(false);
  const [address, setAddress] = useState('');
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const [adjustedLocation, setAdjustedLocation] = useState<{ lat: number; lng: number } | null>(
    null
  );
  const [isLoadingLocation, setIsLoadingLocation] = useState(false);
  const [mapLoadAttempted, setMapLoadAttempted] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [copiedCoords, setCopiedCoords] = useState(false);
  const [copiedAddress, setCopiedAddress] = useState(false);
  const addressInputRef = useRef<HTMLInputElement>(null);

  // Reverse geocode the current/adjusted location to get address
  const displayLat = adjustedLocation?.lat ?? currentLocation?.lat ?? null;
  const displayLng = adjustedLocation?.lng ?? currentLocation?.lng ?? null;
  const { address: currentAddress, isLoading: isAddressLoading } = useReverseGeocode(
    displayLat,
    displayLng,
    null,
    { skip: !displayLat || !displayLng }
  );

  // Fetch current location on mount for map display (for authenticated/guest users)
  // Auto-fetch location to show map immediately
  useEffect(() => {
    // Only attempt once and only if user is authenticated or guest
    if (mapLoadAttempted || (!isAuthenticated && !isGuest)) return;

    // Auto-fetch location on page load to show map
    if (!currentLocation) {
      setMapLoadAttempted(true);
      setIsLoadingLocation(true);
      getCurrentPosition()
        .then((pos) => {
          setCurrentLocation({ lat: pos.lat, lng: pos.lng });
          setLocationAccuracy(pos.accuracy);
        })
        .catch(() => {
          // Silently fail - user can still use the button
        })
        .finally(() => setIsLoadingLocation(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated, isGuest]);

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
   * Handle navigation to the latest spot - opens map picker
   */
  const handleNavigateToSpot = () => {
    if (!latestSpot) return;
    openPicker(latestSpot);
  };

  const handleSignInFromPrompt = () => {
    window.location.href = '/login';
  };

  /**
   * Handle "Save my location" button click
   * Only shows modal if permission was denied, otherwise requests permission directly
   */
  const handleSaveSpotClick = () => {
    // Mark that user explicitly requested location (for error display purposes)
    setUserRequestedLocation(true);

    // Check if user is authenticated or in guest mode
    if (!isAuthenticated && !isGuest) {
      navigate('/login');
      return;
    }

    // Always try to get location - browser will show permission prompt if needed
    // Only show our modal if the actual geolocation request fails
    captureAndSaveLocation();
  };

  /**
   * Threshold for showing low accuracy warning (1km)
   */
  const LOW_ACCURACY_THRESHOLD = 1000;

  /**
   * Check if current accuracy is low (IP-based location)
   */
  const hasLowAccuracy = locationAccuracy !== null && locationAccuracy > LOW_ACCURACY_THRESHOLD;

  /**
   * Detect if running on iOS
   */
  const isIOS = () => {
    if (typeof navigator === 'undefined') return false;
    return (
      /iPad|iPhone|iPod/.test(navigator.userAgent) ||
      (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
    );
  };

  /**
   * Capture location and save the spot
   */
  const captureAndSaveLocation = async () => {
    setIsCapturing(true);
    setShowLocationPrompt(false);
    setSpotError(null);

    try {
      // Use adjusted location if user moved the map, otherwise get current position
      let position;
      if (adjustedLocation) {
        position = { lat: adjustedLocation.lat, lng: adjustedLocation.lng, accuracy: 0 };
      } else if (currentLocation && locationAccuracy !== null) {
        // Use current location from map
        position = {
          lat: currentLocation.lat,
          lng: currentLocation.lng,
          accuracy: locationAccuracy,
        };
      } else {
        position = await getCurrentPosition();
        setCurrentLocation({ lat: position.lat, lng: position.lng });
        setLocationAccuracy(position.accuracy);
      }

      const spot = await saveSpot({
        lat: position.lat,
        lng: position.lng,
        accuracy: position.accuracy,
      });

      // Reset adjusted location
      setAdjustedLocation(null);

      // Navigate to confirmation page
      navigate(`/spot/${spot.id}/confirm`);
    } catch (err: unknown) {
      console.error('Failed to save spot:', err);
      // If permission was denied, show the location prompt modal with instructions
      if (err && typeof err === 'object' && 'code' in err && err.code === 1) {
        setShowLocationPrompt(true);
      }
    } finally {
      setIsCapturing(false);
    }
  };

  /**
   * Handle map position change when user drags
   */
  const handleMapPositionChange = (lat: number, lng: number) => {
    setAdjustedLocation({ lat, lng });
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
  const isSavingSpot = isCapturing || isSaving;
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
          onDismiss={() => setShowLocationPrompt(false)}
          isLoading={isBusy}
          permissionDenied={permissionState === 'denied'}
        />
      )}

      <main className="flex-1 flex flex-col items-center p-4 pt-3 pb-24 text-center">
        {/* Options Container */}
        <div className="w-full max-w-md space-y-6">
          {/* Map Section with Save Button */}
          {(currentLocation || isLoadingLocation) && (
            <div
              className="w-full rounded-xl overflow-hidden shadow-md bg-white"
              data-testid="home-map-section"
            >
              {isLoadingLocation ? (
                <div className="h-48 bg-gray-200 flex items-center justify-center">
                  <div className="flex flex-col items-center gap-2 text-gray-500">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                    <span className="text-sm">Getting your location...</span>
                  </div>
                </div>
              ) : currentLocation ? (
                <SpotMap
                  lat={adjustedLocation?.lat ?? currentLocation.lat}
                  lng={adjustedLocation?.lng ?? currentLocation.lng}
                  editable={true}
                  onPositionChange={handleMapPositionChange}
                  heightClass="aspect-square"
                  testId="home-spot-map"
                />
              ) : null}

              {/* Address display */}
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="flex items-start gap-2">
                  <span className="text-gray-400" aria-hidden="true">
                    📍
                  </span>
                  <div className="flex-1 text-left">
                    {isAddressLoading ? (
                      <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
                    ) : currentAddress ? (
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(currentAddress);
                          if (navigator.vibrate) {
                            navigator.vibrate(50);
                          }
                          setCopiedAddress(true);
                          setTimeout(() => setCopiedAddress(false), 1500);
                        }}
                        className="relative text-sm font-medium text-gray-800 text-left hover:text-indigo-600 transition-colors"
                        data-testid="home-current-address"
                        title="Tap to copy address"
                      >
                        <span className={copiedAddress ? 'invisible' : ''}>{currentAddress}</span>
                        {copiedAddress && (
                          <span className="absolute inset-0 flex items-center text-green-600 text-sm font-medium">
                            Copied
                          </span>
                        )}
                      </button>
                    ) : (
                      <p className="text-sm text-gray-500">Address unavailable</p>
                    )}
                    {/* Always show coordinates */}
                    {displayLat && displayLng && (
                      <button
                        type="button"
                        onClick={() => {
                          const coords = `${displayLat.toFixed(6)}, ${displayLng.toFixed(6)}`;
                          navigator.clipboard.writeText(coords);
                          if (navigator.vibrate) {
                            navigator.vibrate(50);
                          }
                          setCopiedCoords(true);
                          setTimeout(() => setCopiedCoords(false), 1500);
                        }}
                        className="relative text-sm text-gray-500 hover:text-indigo-600 mt-1 flex items-center gap-1 transition-colors"
                        title="Tap to copy coordinates"
                      >
                        <span className={copiedCoords ? 'invisible' : ''}>
                          {displayLat.toFixed(4)}°N, {displayLng.toFixed(4)}°E
                        </span>
                        {copiedCoords ? (
                          <span className="absolute inset-0 flex items-center text-green-600 text-sm font-medium">
                            Copied
                          </span>
                        ) : (
                          <svg
                            className="w-3 h-3"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                            />
                          </svg>
                        )}
                      </button>
                    )}
                    {adjustedLocation && (
                      <p className="text-xs text-indigo-600 mt-1">Position adjusted</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Hint text */}
              <p className="px-3 py-0.5 text-xs text-gray-500 text-center border-b border-gray-100">
                Drag the map to adjust your parking location
              </p>

              {/* Low accuracy warning - inline */}
              {hasLowAccuracy && (
                <div className="mx-4 mt-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <span className="text-amber-500 text-lg">⚠️</span>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-amber-800">
                        Low accuracy (~{(locationAccuracy! / 1000).toFixed(1)}km)
                      </p>
                      {isIOS() ? (
                        <div className="text-xs text-amber-700 mt-1">
                          <p className="mb-1">Enable Precise Location:</p>
                          <p>
                            <strong>Settings</strong> → <strong>Privacy</strong> →{' '}
                            <strong>Location Services</strong> → <strong>Chrome</strong> →{' '}
                            <strong>Precise Location ON</strong>
                          </p>
                          <p className="mt-1 text-gray-600">
                            Then refresh the page, or drag the map to adjust manually.
                          </p>
                        </div>
                      ) : (
                        <p className="text-xs text-amber-700 mt-1">
                          Enable GPS in device settings and refresh, or drag the map to adjust
                          manually.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Save button inside the card */}
              <div className="p-4">
                <button
                  onClick={handleSaveSpotClick}
                  disabled={isBusy}
                  className="w-full px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-lg font-semibold rounded-lg shadow-md hover:shadow-lg transition-all flex items-center gap-2 justify-center"
                  data-testid="save-spot-button"
                >
                  {isSavingSpot ? (
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
                    'Save my location'
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Fallback button when no map/location */}
          {!currentLocation && !isLoadingLocation && (
            <button
              onClick={handleSaveSpotClick}
              disabled={isBusy}
              className="w-full px-8 py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white text-xl font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all transform hover:scale-105 disabled:hover:scale-100 flex items-center gap-3 justify-center"
              data-testid="save-spot-button"
            >
              {isSavingSpot ? (
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
                  Save my location
                </>
              )}
            </button>
          )}

          {/* Manual address entry - collapsed by default */}
          {!showAddressForm ? (
            <button
              type="button"
              onClick={() => setShowAddressForm(true)}
              className="w-full flex items-center justify-center gap-3 text-gray-500 hover:text-gray-700 transition-colors"
              data-testid="show-address-form-button"
            >
              <svg
                className="w-5 h-5 shrink-0"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v16m8-8H4"
                />
              </svg>
              <div className="flex-1 h-px bg-gray-300" />
              <span className="text-base whitespace-nowrap px-3">or Enter address manually ✏️</span>
              <div className="flex-1 h-px bg-gray-300" />
            </button>
          ) : (
            <>
              {/* Divider */}
              <div className="flex items-center gap-4">
                <div className="flex-1 h-px bg-gray-300" />
                <span className="text-gray-500 font-medium">or</span>
                <div className="flex-1 h-px bg-gray-300" />
              </div>

              {/* Address form */}
              <form onSubmit={handleAddressSubmit} className="space-y-3">
                <label
                  htmlFor="address-input"
                  className="block text-left text-gray-700 font-medium"
                >
                  Enter parking address
                </label>
                <input
                  ref={addressInputRef}
                  id="address-input"
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g., 123 Main St, City"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-lg text-gray-900 placeholder-gray-400"
                  data-testid="address-input"
                  autoFocus
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddressForm(false);
                      setAddress('');
                    }}
                    className="px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!address.trim() || isAddressBusy}
                    className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-900 disabled:bg-gray-400 text-white text-lg font-semibold rounded-lg transition-colors flex items-center gap-2 justify-center"
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
                        <span className="text-xl font-black">#</span>
                        Save spot
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>

        {/* Latest Spot Card - shown when authenticated or in guest mode */}
        {(isAuthenticated || isGuest) && (
          <div className="w-full max-w-md mt-4">
            <h2 className="text-left text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">
              Last parked spot
            </h2>
            <LatestSpotCard
              spot={latestSpot}
              carTagName={getTagInfo().name}
              carTagColor={getTagInfo().color}
              onNavigate={handleNavigateToSpot}
              isLoading={isLoadingLatest}
            />
          </div>
        )}

        {/* Error Display - only show location error if user explicitly requested location */}
        {(spotError || (locationError && userRequestedLocation) || geocodeError) && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg max-w-md">
            <p className="text-red-700">
              {spotError || (userRequestedLocation ? locationError?.message : null) || geocodeError}
            </p>
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

      {/* Map Picker Modal */}
      <MapPickerModal
        isOpen={isPickerOpen}
        onClose={closePicker}
        onSelect={(provider) => pendingSpot && navigateToSpot(pendingSpot, provider)}
      />
    </div>
  );
};
