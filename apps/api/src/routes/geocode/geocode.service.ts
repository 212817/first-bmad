// apps/api/src/routes/geocode/geocode.service.ts
import { geocodingService } from '../../services/geocoding/geocoding.service.js';
import { ValidationError, NotFoundError } from '@repo/shared/errors';
import type { GeocodeResponse } from './types.js';

/** Minimum address length for geocoding */
const MIN_ADDRESS_LENGTH = 5;

/**
 * Geocode route service - handles geocoding business logic
 */
export const geocodeRouteService = {
  /**
   * Geocode an address to coordinates
   * @throws ValidationError if address is too short
   * @throws NotFoundError if address cannot be geocoded
   */
  geocodeAddress: async (address: string): Promise<GeocodeResponse> => {
    // Validate address length
    const trimmed = address?.trim();
    if (!trimmed || trimmed.length < MIN_ADDRESS_LENGTH) {
      throw new ValidationError('Address must be at least 5 characters', {
        address: `Minimum ${MIN_ADDRESS_LENGTH} characters required`,
      });
    }

    // Call geocoding service
    const result = await geocodingService.geocodeAddress(trimmed);

    if (!result) {
      throw new NotFoundError('Address could not be found');
    }

    return {
      lat: result.lat,
      lng: result.lng,
      formattedAddress: result.formattedAddress,
    };
  },
};
