// apps/api/src/routes/spots/spots.service.ts
import { spotRepository } from '../../repositories/spot.repository.js';
import { shareTokenRepository } from '../../repositories/shareToken.repository.js';
import { carTagRepository } from '../../repositories/carTag.repository.js';
import { geocodingService } from '../../services/geocoding/geocoding.service.js';
import { r2Service } from '../../services/r2/r2.service.js';
import { NotFoundError, AuthorizationError, ValidationError } from '@repo/shared/errors';
import type { ParkingSpot } from '@repo/shared/types';
import type {
  CreateSpotRequest,
  UpdateSpotRequest,
  SpotResponse,
  CreateShareLinkResponse,
} from './types.js';
import { isAddressOnlyRequest } from './types.js';
import { env } from '../../config/env.js';

/**
 * Map internal ParkingSpot to API response
 */
const mapToResponse = (spot: ParkingSpot): SpotResponse => {
  const savedAtDate = spot.savedAt instanceof Date ? spot.savedAt : new Date(spot.savedAt);
  return {
    id: spot.id,
    carTagId: spot.carTagId,
    lat: spot.latitude ?? null,
    lng: spot.longitude ?? null,
    accuracyMeters: spot.accuracyMeters,
    address: spot.address,
    photoUrl: spot.photoUrl,
    note: spot.note,
    floor: spot.floor,
    spotIdentifier: spot.spotIdentifier,
    meterExpiresAt: spot.meterExpiresAt ? spot.meterExpiresAt.toISOString() : null,
    isActive: spot.isActive,
    savedAt: savedAtDate.toISOString(),
  };
};

/**
 * Trigger async reverse geocoding and update spot with address
 * Fire-and-forget: don't block the response, don't fail if geocoding fails
 */
const triggerAsyncReverseGeocode = (spotId: string, lat: number, lng: number): void => {
  geocodingService
    .reverseGeocode(lat, lng)
    .then(async (result) => {
      if (result) {
        await spotRepository.update(spotId, { address: result.address });
      }
    })
    .catch((error) => {
      console.error('[Spots] Async reverse geocoding failed:', error);
      // Don't throw - spot already saved
    });
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
 * Validate address for address-only spots
 */
const validateAddress = (address: string): void => {
  if (!address || typeof address !== 'string') {
    throw new ValidationError('Address is required', { address: 'Address is required' });
  }

  const trimmed = address.trim();
  if (trimmed.length < 5) {
    throw new ValidationError('Address must be at least 5 characters', {
      address: 'Address must be at least 5 characters',
    });
  }

  if (trimmed.length > 500) {
    throw new ValidationError('Address must be 500 characters or less', {
      address: 'Address must be 500 characters or less',
    });
  }
};

/**
 * Get the default "My Car" tag ID for spots without explicit tag
 * Creates the default tag if it doesn't exist
 */
const getDefaultCarTagId = async (): Promise<string> => {
  let myCarTag = await carTagRepository.findDefaultByName('My Car');
  if (!myCarTag) {
    // Create the default tag if it doesn't exist
    myCarTag = await carTagRepository.createDefault('My Car', '#3B82F6');
  }
  return myCarTag.id;
};

/**
 * Spots service - business logic for parking spots
 */
export const spotsService = {
  /**
   * Create a new parking spot
   * Supports both GPS-based and address-only modes
   * Assigns default "My Car" tag if no tag is specified
   */
  async createSpot(userId: string, input: CreateSpotRequest): Promise<SpotResponse> {
    if (isAddressOnlyRequest(input)) {
      // Address-only mode (manual entry)
      validateAddress(input.address);

      // Optionally validate coordinates if provided
      if (input.lat != null && input.lng != null) {
        validateCoordinates(input.lat, input.lng);
      }

      // Get default tag ID after validation
      const defaultCarTagId = await getDefaultCarTagId();

      const spot = await spotRepository.create({
        userId,
        carTagId: defaultCarTagId,
        latitude: input.lat ?? null,
        longitude: input.lng ?? null,
        accuracyMeters: null,
        address: input.address.trim(),
      });

      // Trigger async reverse geocoding if we have coords but no detailed address yet
      // (Address-only spots already have user-provided address)
      if (input.lat != null && input.lng != null) {
        triggerAsyncReverseGeocode(spot.id, input.lat, input.lng);
      }

      return mapToResponse(spot);
    }

    // GPS-based mode (normal flow)
    validateCoordinates(input.lat, input.lng);

    // Get default tag ID after validation
    const defaultCarTagId = await getDefaultCarTagId();

    const spot = await spotRepository.create({
      userId,
      carTagId: defaultCarTagId,
      latitude: input.lat,
      longitude: input.lng,
      accuracyMeters: input.accuracyMeters ?? null,
    });

    // Trigger async reverse geocoding for GPS-based spots (fire-and-forget)
    triggerAsyncReverseGeocode(spot.id, input.lat, input.lng);

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
   * Get user's latest spot (most recent by savedAt)
   * Returns null if no spots exist
   */
  async getLatestSpot(userId: string): Promise<SpotResponse | null> {
    const spot = await spotRepository.findLatestByUserId(userId);
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
   * Get user's spots with cursor-based pagination
   * Supports text search and filters
   */
  async getUserSpotsPaginated(
    userId: string,
    limit = 20,
    cursor?: string,
    searchOptions?: {
      query?: string;
      carTagId?: string;
      startDate?: Date;
      endDate?: Date;
    }
  ): Promise<{ spots: SpotResponse[]; nextCursor: string | null }> {
    const result = await spotRepository.findByUserIdPaginated(userId, limit, cursor, searchOptions);
    return {
      spots: result.spots.map(mapToResponse),
      nextCursor: result.nextCursor,
    };
  },

  /**
   * Update a spot
   */
  async updateSpot(
    userId: string,
    spotId: string,
    input: UpdateSpotRequest
  ): Promise<SpotResponse> {
    // Validate note length (max 500 characters)
    if (input.note !== undefined && input.note !== null && input.note.length > 500) {
      throw new ValidationError('Note must be 500 characters or less', {
        note: 'Note must be 500 characters or less',
      });
    }

    // Validate meterExpiresAt if provided (must be in the future)
    if (input.meterExpiresAt !== undefined && input.meterExpiresAt !== null) {
      const meterDate = new Date(input.meterExpiresAt);
      if (isNaN(meterDate.getTime())) {
        throw new ValidationError('Invalid meter expiry date format', {
          meterExpiresAt: 'Invalid date format',
        });
      }
      if (meterDate.getTime() <= Date.now()) {
        throw new ValidationError('Meter expiry must be in the future', {
          meterExpiresAt: 'Meter expiry must be in the future',
        });
      }
    }

    // Validate coordinates if provided
    const hasLatLng = input.lat !== undefined && input.lng !== undefined;
    if (hasLatLng) {
      validateCoordinates(input.lat!, input.lng!);
    }

    const spot = await spotRepository.findById(spotId);

    if (!spot) {
      throw new NotFoundError('Parking spot');
    }

    if (spot.userId !== userId) {
      throw new AuthorizationError('Not authorized to update this spot');
    }

    // Map lat/lng to internal field names
    const updateData: Record<string, unknown> = { ...input };
    if (hasLatLng) {
      updateData.latitude = input.lat;
      updateData.longitude = input.lng;
      delete updateData.lat;
      delete updateData.lng;
      // Clear address so it can be re-geocoded
      updateData.address = null;
    }

    // Map accuracy to accuracyMeters
    if (input.accuracy !== undefined) {
      updateData.accuracyMeters = input.accuracy;
      delete updateData.accuracy;
    }

    // Convert meterExpiresAt string to Date (or null to clear)
    if (input.meterExpiresAt !== undefined) {
      updateData.meterExpiresAt = input.meterExpiresAt ? new Date(input.meterExpiresAt) : null;
    }

    const updated = await spotRepository.update(spotId, updateData);

    // Trigger reverse geocoding if coordinates were updated
    if (hasLatLng) {
      triggerAsyncReverseGeocode(spotId, input.lat!, input.lng!);
    }

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
   * Also deletes associated photo from R2 storage (fire-and-forget)
   */
  async deleteSpot(userId: string, spotId: string): Promise<void> {
    const spot = await spotRepository.findById(spotId);

    if (!spot) {
      throw new NotFoundError('Parking spot');
    }

    if (spot.userId !== userId) {
      throw new AuthorizationError('Not authorized to delete this spot');
    }

    // Delete spot from database first
    await spotRepository.delete(spotId);

    // Clean up photo from R2 (fire-and-forget)
    if (spot.photoUrl) {
      const key = extractPhotoKeyFromUrl(spot.photoUrl);
      if (key) {
        r2Service.deleteObject(key).catch((error) => {
          console.error('[Spots] Failed to delete photo from R2:', error);
          // Don't throw - spot already deleted
        });
      }
    }
  },

  /**
   * Create a shareable link for a parking spot
   * Generates a unique token valid for 7 days
   */
  async createShareLink(userId: string, spotId: string): Promise<CreateShareLinkResponse> {
    // Verify spot exists and user owns it
    const spot = await spotRepository.findById(spotId);

    if (!spot) {
      throw new NotFoundError('Parking spot');
    }

    if (spot.userId !== userId) {
      throw new AuthorizationError('Not authorized to share this spot');
    }

    // Generate unique token (use crypto for secure random string)
    const token = crypto.randomUUID().replace(/-/g, '').slice(0, 32);

    // Set expiration to 7 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    // Store the share token
    await shareTokenRepository.create({
      spotId,
      token,
      expiresAt,
    });

    // Build share URL
    const frontendUrl = env.FRONTEND_URL || 'http://localhost:5173';
    const shareUrl = `${frontendUrl}/s/${token}`;

    return {
      shareUrl,
      expiresAt: expiresAt.toISOString(),
    };
  },
};

/**
 * Extract the R2 key from a photo URL
 * Handles both public URLs and signed URLs
 */
const extractPhotoKeyFromUrl = (photoUrl: string): string | null => {
  try {
    const url = new URL(photoUrl);
    // The path should be like /photos/{userId}/{timestamp}-{random}.{ext}
    const path = url.pathname;
    // Remove leading slash
    const key = path.startsWith('/') ? path.slice(1) : path;
    // Validate it's a photos key
    if (key.startsWith('photos/')) {
      return key;
    }
    return null;
  } catch {
    return null;
  }
};
