# 6. Service Layer

### 6.1 Service Pattern

```typescript
// routes/spots/spots.service.ts
import { spotRepository } from '@/repositories/spot.repository';
import { geocodingService } from '@/services/geocoding/geocoding.service';
import { NotFoundError, AuthorizationError } from '@repo/shared/errors';
import type { CreateSpotInput, UpdateSpotInput } from './types';
import type { ParkingSpot } from '@repo/shared/types';

export const spotsService = {
  createSpot: async (userId: string, data: CreateSpotInput): Promise<ParkingSpot> => {
    // Deactivate any existing active spot
    await spotRepository.deactivateUserSpots(userId);

    // Reverse geocode to get address
    let address: string | null = null;
    try {
      address = await geocodingService.reverseGeocode(data.latitude, data.longitude);
    } catch {
      // Non-critical - continue without address
    }

    // Create the spot
    const spot = await spotRepository.create({
      userId,
      latitude: data.latitude,
      longitude: data.longitude,
      address,
      photoUrl: data.photoUrl,
      note: data.note,
      floor: data.floor,
      spotIdentifier: data.spotIdentifier,
      isActive: true,
    });

    // Add tags if provided
    if (data.tags?.length) {
      await spotRepository.addTags(spot.id, data.tags);
    }

    return spot;
  },

  getActiveSpot: async (userId: string): Promise<ParkingSpot | null> => {
    return spotRepository.findActiveByUser(userId);
  },

  getSpotById: async (userId: string, spotId: string): Promise<ParkingSpot> => {
    const spot = await spotRepository.findById(spotId);

    if (!spot) {
      throw new NotFoundError('Parking spot');
    }

    if (spot.userId !== userId) {
      throw new AuthorizationError('Not authorized to access this spot');
    }

    return spot;
  },

  getSpots: async (userId: string, options: { page: number; limit: number }) => {
    const [spots, total] = await Promise.all([
      spotRepository.findByUser(userId, options),
      spotRepository.countByUser(userId),
    ]);

    return {
      data: spots,
      meta: {
        page: options.page,
        limit: options.limit,
        total,
        hasMore: options.page * options.limit < total,
      },
    };
  },

  clearSpot: async (userId: string, spotId: string): Promise<ParkingSpot> => {
    const spot = await spotsService.getSpotById(userId, spotId);
    return spotRepository.update(spotId, { isActive: false });
  },

  updateSpot: async (
    userId: string,
    spotId: string,
    data: UpdateSpotInput
  ): Promise<ParkingSpot> => {
    await spotsService.getSpotById(userId, spotId); // Verify ownership
    return spotRepository.update(spotId, data);
  },

  deleteSpot: async (userId: string, spotId: string): Promise<void> => {
    await spotsService.getSpotById(userId, spotId); // Verify ownership
    await spotRepository.delete(spotId);
  },
};
```

---
