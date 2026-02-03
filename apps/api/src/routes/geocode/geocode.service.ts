// apps/api/src/routes/geocode/geocode.service.ts
import { geocodingService } from '../../services/geocoding/geocoding.service.js';
import { ValidationError, NotFoundError } from '@repo/shared/errors';
import type { GeocodeResponse, ReverseGeocodeResponse } from './types.js';

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

  /**
   * Reverse geocode coordinates to address
   * @throws ValidationError if coordinates are invalid
   * @throws NotFoundError if coordinates cannot be geocoded
   */
  reverseGeocode: async (lat: number, lng: number): Promise<ReverseGeocodeResponse> => {
    // Validate latitude
    if (typeof lat !== 'number' || isNaN(lat)) {
      throw new ValidationError('Invalid coordinates', {
        lat: 'Latitude must be a valid number',
      });
    }
    if (lat < -90 || lat > 90) {
      throw new ValidationError('Invalid coordinates', {
        lat: 'Latitude must be between -90 and 90',
      });
    }

    // Validate longitude
    if (typeof lng !== 'number' || isNaN(lng)) {
      throw new ValidationError('Invalid coordinates', {
        lng: 'Longitude must be a valid number',
      });
    }
    if (lng < -180 || lng > 180) {
      throw new ValidationError('Invalid coordinates', {
        lng: 'Longitude must be between -180 and 180',
      });
    }

    // Call geocoding service
    const result = await geocodingService.reverseGeocode(lat, lng);

    if (!result) {
      throw new NotFoundError('Location could not be geocoded');
    }

    return {
      address: result.address,
      formattedAddress: result.formattedAddress,
    };
  },
};
