// apps/web/src/pages/ManualEntryPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSpotStore } from '@/stores/spotStore';
import { useGuestStore } from '@/stores/guestStore';
import { useAuthStore } from '@/stores/authStore';
import { geocodingApi } from '@/services/api/geocodingApi';
import { AddressInput } from '@/components/spot/AddressInput';
import { GuestModeBanner } from '@/components/ui/GuestModeBanner';
import { Header } from '@/components/layout/Header';

/**
 * Manual address entry page
 * Shown when user denies location permission
 */
export const ManualEntryPage = () => {
  const navigate = useNavigate();
  const { saveSpot, isSaving, error: spotError, setError: setSpotError } = useSpotStore();
  const { isGuest } = useGuestStore();
  const { authMode } = useAuthStore();
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [geocodeWarning, setGeocodeWarning] = useState<string | null>(null);

  /**
   * Handle address submission
   */
  const handleAddressSubmit = async (address: string) => {
    setSpotError(null);
    setGeocodeWarning(null);

    // For guest users, skip geocoding to preserve API quota
    if (isGuest) {
      try {
        const spot = await saveSpot({ address });
        navigate(`/spot/${spot.id}/confirm`);
      } catch {
        // Error already handled in store
      }
      return;
    }

    // For authenticated users, try geocoding first
    setIsGeocoding(true);

    try {
      const result = await geocodingApi.geocodeAddress(address);

      if (result) {
        // Geocoding succeeded - save with coordinates
        const spot = await saveSpot({
          address: result.formattedAddress || address,
          lat: result.lat,
          lng: result.lng,
        });
        navigate(`/spot/${spot.id}/confirm`);
      } else {
        // Geocoding failed - save with address only
        setGeocodeWarning('Address could not be found. Saving with address only.');
        const spot = await saveSpot({ address });
        navigate(`/spot/${spot.id}/confirm`);
      }
    } catch (error) {
      // Geocoding API error - save with address only as fallback
      console.error('Geocoding failed:', error);
      setGeocodeWarning('Could not look up address. Saving with address only.');
      try {
        const spot = await saveSpot({ address });
        navigate(`/spot/${spot.id}/confirm`);
      } catch {
        // Error already handled in store
      }
    } finally {
      setIsGeocoding(false);
    }
  };

  /**
   * Handle back navigation
   */
  const handleBack = () => {
    navigate('/');
  };

  const isLoading = isGeocoding || isSaving;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col">
      {/* Header */}
      <Header />

      {/* Guest Mode Banner */}
      {authMode === 'guest' && <GuestModeBanner />}

      <main className="flex-1 flex flex-col p-4 max-w-md mx-auto w-full">
        {/* Back button */}
        <button
          onClick={handleBack}
          className="self-start mb-4 text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </button>

        {/* Page title */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Enter Address Manually</h1>
          <p className="text-gray-600">
            Enter the address where you parked. We&apos;ll try to find the exact location.
          </p>
        </div>

        {/* Guest mode warning */}
        {isGuest && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
            <p>
              <strong>Guest Mode:</strong> Address will be saved locally without looking up
              coordinates. Sign in for full navigation features.
            </p>
          </div>
        )}

        {/* Geocode warning */}
        {geocodeWarning && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm flex items-start gap-2">
            <svg
              className="w-5 h-5 flex-shrink-0 mt-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
            <span>{geocodeWarning}</span>
          </div>
        )}

        {/* Error display */}
        {spotError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
            {spotError}
          </div>
        )}

        {/* Address input form */}
        <AddressInput onSubmit={handleAddressSubmit} isLoading={isLoading} />
      </main>
    </div>
  );
};
