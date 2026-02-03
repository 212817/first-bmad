// apps/web/src/hooks/useReverseGeocode/useReverseGeocode.ts
import { useState, useEffect } from 'react';
import { geocodingApi } from '@/services/api/geocodingApi';
import type { UseReverseGeocodeState, UseReverseGeocodeOptions } from './types';

/** Default delay before fetching address (allows backend async to complete) */
const DEFAULT_DELAY = 1000;

/**
 * Hook for fetching address from coordinates via reverse geocoding
 *
 * @param lat - Latitude coordinate (or null)
 * @param lng - Longitude coordinate (or null)
 * @param existingAddress - Existing address to use if available
 * @param options - Hook options
 * @returns State with address, loading status, and error
 */
export const useReverseGeocode = (
  lat: number | null,
  lng: number | null,
  existingAddress: string | null,
  options: UseReverseGeocodeOptions = {}
): UseReverseGeocodeState => {
  const { delay = DEFAULT_DELAY, skip = false } = options;

  const [address, setAddress] = useState<string | null>(existingAddress);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // If we already have an address, don't fetch
    if (existingAddress) {
      setAddress(existingAddress);
      return;
    }

    // Skip if told to (e.g., guest mode) or no coordinates
    if (skip || lat === null || lng === null) {
      return;
    }

    let isCancelled = false;

    const fetchAddress = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await geocodingApi.reverseGeocode(lat, lng);

        if (!isCancelled && result) {
          setAddress(result.address);
        }
      } catch (err) {
        if (!isCancelled) {
          const message = err instanceof Error ? err.message : 'Failed to fetch address';
          setError(message);
          console.warn('[useReverseGeocode] Failed to fetch address:', message);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    // Delay fetch to allow backend async geocoding to complete first
    const timeoutId = setTimeout(fetchAddress, delay);

    return () => {
      isCancelled = true;
      clearTimeout(timeoutId);
    };
  }, [lat, lng, existingAddress, delay, skip]);

  return { address, isLoading, error };
};
