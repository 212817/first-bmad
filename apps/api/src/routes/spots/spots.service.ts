// apps/api/src/routes/spots/spots.service.ts
import { spotRepository } from '../../repositories/spot.repository.js';
import { NotFoundError, AuthorizationError, ValidationError } from '@repo/shared/errors';
import type { ParkingSpot } from '@repo/shared/types';
import type { CreateSpotRequest, UpdateSpotRequest, SpotResponse } from './types.js';

/**
 * Map internal ParkingSpot to API response
 */
const mapToResponse = (spot: ParkingSpot): SpotResponse => {
  const savedAtDate = spot.savedAt instanceof Date ? spot.savedAt : new Date(spot.savedAt);
  return {
    id: spot.id,
    lat: spot.latitude,
    lng: spot.longitude,
    accuracyMeters: spot.accuracyMeters,
    address: spot.address,
    photoUrl: spot.photoUrl,
    note: spot.note,
    floor: spot.floor,
    spotIdentifier: spot.spotIdentifier,
    isActive: spot.isActive,
    savedAt: savedAtDate.toISOString(),
  };
};

/**
 * Validate latitude and longitude values
 */
const validateCoordinates = (lat: number, lng: number): void => {
  const errors: Record<string, string> = {};

  if (typeof lat !== 'number' || isNaN(lat)) {
    errors.lat = 'Latitude must be a valid number';
  } else if (lat < -90 || lat > 90) {
    errors.lat = 'Latitude must be between -90 and 90';
  }

  if (typeof lng !== 'number' || isNaN(lng)) {
    errors.lng = 'Longitude must be a valid number';
  } else if (lng < -180 || lng > 180) {
    errors.lng = 'Longitude must be between -180 and 180';
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError('Invalid coordinates', errors);
  }
};

/**
 * Spots service - business logic for parking spots
 */
export const spotsService = {
  /**
   * Create a new parking spot
   */
  async createSpot(userId: string, input: CreateSpotRequest): Promise<SpotResponse> {
    validateCoordinates(input.lat, input.lng);

    const spot = await spotRepository.create({
      userId,
      latitude: input.lat,
      longitude: input.lng,
      accuracyMeters: input.accuracyMeters ?? null,
    });

    return mapToResponse(spot);
  },

  /**
   * Get a spot by ID (with ownership check)
   */
  async getSpotById(userId: string, spotId: string): Promise<SpotResponse> {
    const spot = await spotRepository.findById(spotId);

    if (!spot) {
      throw new NotFoundError('Parking spot');
    }

    if (spot.userId !== userId) {
      throw new AuthorizationError('Not authorized to access this spot');
    }

    return mapToResponse(spot);
  },

  /**
   * Get user's active spot
   */
  async getActiveSpot(userId: string): Promise<SpotResponse | null> {
    const spot = await spotRepository.findActiveByUserId(userId);
    return spot ? mapToResponse(spot) : null;
  },

  /**
   * Get user's spots (paginated)
   */
  async getUserSpots(userId: string, limit = 50): Promise<SpotResponse[]> {
    const spots = await spotRepository.findByUserId(userId, limit);
    return spots.map(mapToResponse);
  },

  /**
   * Update a spot
   */
  async updateSpot(
    userId: string,
    spotId: string,
    input: UpdateSpotRequest
  ): Promise<SpotResponse> {
    const spot = await spotRepository.findById(spotId);

    if (!spot) {
      throw new NotFoundError('Parking spot');
    }

    if (spot.userId !== userId) {
      throw new AuthorizationError('Not authorized to update this spot');
    }

    const updated = await spotRepository.update(spotId, input);
    return mapToResponse(updated!);
  },

  /**
   * Clear/deactivate a spot
   */
  async clearSpot(userId: string, spotId: string): Promise<SpotResponse> {
    const spot = await spotRepository.findById(spotId);

    if (!spot) {
      throw new NotFoundError('Parking spot');
    }

    if (spot.userId !== userId) {
      throw new AuthorizationError('Not authorized to clear this spot');
    }

    const updated = await spotRepository.update(spotId, { isActive: false });
    return mapToResponse(updated!);
  },

  /**
   * Delete a spot
   */
  async deleteSpot(userId: string, spotId: string): Promise<void> {
    const spot = await spotRepository.findById(spotId);

    if (!spot) {
      throw new NotFoundError('Parking spot');
    }

    if (spot.userId !== userId) {
      throw new AuthorizationError('Not authorized to delete this spot');
    }

    await spotRepository.delete(spotId);
  },
};
