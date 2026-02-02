// apps/api/test/unit/spots.service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { spotsService } from '../../src/routes/spots/spots.service.js';
import { spotRepository } from '../../src/repositories/spot.repository.js';
import { NotFoundError, AuthorizationError, ValidationError } from '@repo/shared/errors';

vi.mock('../../src/repositories/spot.repository.js', () => ({
  spotRepository: {
    create: vi.fn(),
    findById: vi.fn(),
    findByUserId: vi.fn(),
    findActiveByUserId: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('spotsService', () => {
  const userId = 'user-123';
  const spotId = 'spot-123';

  const mockSpot = {
    id: spotId,
    userId,
    latitude: 40.7128,
    longitude: -74.006,
    accuracyMeters: 15,
    address: null,
    photoUrl: null,
    note: null,
    floor: null,
    spotIdentifier: null,
    isActive: true,
    savedAt: new Date('2026-01-15T12:00:00Z'),
    createdAt: new Date('2026-01-15T12:00:00Z'),
    updatedAt: new Date('2026-01-15T12:00:00Z'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createSpot', () => {
    it('should create spot with valid coordinates', async () => {
      vi.mocked(spotRepository.create).mockResolvedValue(mockSpot);

      const result = await spotsService.createSpot(userId, {
        lat: 40.7128,
        lng: -74.006,
        accuracyMeters: 15,
      });

      expect(spotRepository.create).toHaveBeenCalledWith({
        userId,
        latitude: 40.7128,
        longitude: -74.006,
        accuracyMeters: 15,
      });
      expect(result.lat).toBe(40.7128);
      expect(result.lng).toBe(-74.006);
    });

    it('should throw ValidationError for invalid latitude (too high)', async () => {
      await expect(spotsService.createSpot(userId, { lat: 91, lng: -74.006 })).rejects.toThrow(
        ValidationError
      );
    });

    it('should throw ValidationError for invalid latitude (too low)', async () => {
      await expect(spotsService.createSpot(userId, { lat: -91, lng: -74.006 })).rejects.toThrow(
        ValidationError
      );
    });

    it('should throw ValidationError for invalid longitude (too high)', async () => {
      await expect(spotsService.createSpot(userId, { lat: 40, lng: 181 })).rejects.toThrow(
        ValidationError
      );
    });

    it('should throw ValidationError for invalid longitude (too low)', async () => {
      await expect(spotsService.createSpot(userId, { lat: 40, lng: -181 })).rejects.toThrow(
        ValidationError
      );
    });

    it('should throw ValidationError for NaN latitude', async () => {
      await expect(spotsService.createSpot(userId, { lat: NaN, lng: -74 })).rejects.toThrow(
        ValidationError
      );
    });

    it('should throw ValidationError for NaN longitude', async () => {
      await expect(spotsService.createSpot(userId, { lat: 40, lng: NaN })).rejects.toThrow(
        ValidationError
      );
    });

    it('should create spot without accuracyMeters', async () => {
      vi.mocked(spotRepository.create).mockResolvedValue({
        ...mockSpot,
        accuracyMeters: null,
      });

      await spotsService.createSpot(userId, {
        lat: 40.7128,
        lng: -74.006,
      });

      expect(spotRepository.create).toHaveBeenCalledWith({
        userId,
        latitude: 40.7128,
        longitude: -74.006,
        accuracyMeters: null,
      });
    });
  });

  describe('getSpotById', () => {
    it('should return spot when found and owned', async () => {
      vi.mocked(spotRepository.findById).mockResolvedValue(mockSpot);

      const result = await spotsService.getSpotById(userId, spotId);

      expect(result.id).toBe(spotId);
      expect(result.lat).toBe(40.7128);
    });

    it('should throw NotFoundError when spot not found', async () => {
      vi.mocked(spotRepository.findById).mockResolvedValue(null);

      await expect(spotsService.getSpotById(userId, spotId)).rejects.toThrow(NotFoundError);
    });

    it('should throw AuthorizationError when spot owned by different user', async () => {
      vi.mocked(spotRepository.findById).mockResolvedValue({
        ...mockSpot,
        userId: 'other-user',
      });

      await expect(spotsService.getSpotById(userId, spotId)).rejects.toThrow(AuthorizationError);
    });
  });

  describe('getActiveSpot', () => {
    it('should return active spot when exists', async () => {
      vi.mocked(spotRepository.findActiveByUserId).mockResolvedValue(mockSpot);

      const result = await spotsService.getActiveSpot(userId);

      expect(result).not.toBeNull();
      expect(result?.isActive).toBe(true);
    });

    it('should return null when no active spot', async () => {
      vi.mocked(spotRepository.findActiveByUserId).mockResolvedValue(null);

      const result = await spotsService.getActiveSpot(userId);

      expect(result).toBeNull();
    });
  });

  describe('getUserSpots', () => {
    it('should return array of spots', async () => {
      vi.mocked(spotRepository.findByUserId).mockResolvedValue([mockSpot]);

      const result = await spotsService.getUserSpots(userId);

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe(spotId);
    });

    it('should return empty array when no spots', async () => {
      vi.mocked(spotRepository.findByUserId).mockResolvedValue([]);

      const result = await spotsService.getUserSpots(userId);

      expect(result).toHaveLength(0);
    });

    it('should pass limit to repository', async () => {
      vi.mocked(spotRepository.findByUserId).mockResolvedValue([]);

      await spotsService.getUserSpots(userId, 10);

      expect(spotRepository.findByUserId).toHaveBeenCalledWith(userId, 10);
    });
  });

  describe('updateSpot', () => {
    it('should update spot when owned', async () => {
      vi.mocked(spotRepository.findById).mockResolvedValue(mockSpot);
      vi.mocked(spotRepository.update).mockResolvedValue({
        ...mockSpot,
        note: 'Updated note',
      });

      const result = await spotsService.updateSpot(userId, spotId, { note: 'Updated note' });

      expect(result.note).toBe('Updated note');
    });

    it('should throw NotFoundError when spot not found', async () => {
      vi.mocked(spotRepository.findById).mockResolvedValue(null);

      await expect(spotsService.updateSpot(userId, spotId, { note: 'Test' })).rejects.toThrow(
        NotFoundError
      );
    });

    it('should throw AuthorizationError when spot owned by different user', async () => {
      vi.mocked(spotRepository.findById).mockResolvedValue({
        ...mockSpot,
        userId: 'other-user',
      });

      await expect(spotsService.updateSpot(userId, spotId, { note: 'Test' })).rejects.toThrow(
        AuthorizationError
      );
    });
  });

  describe('clearSpot', () => {
    it('should set isActive to false', async () => {
      vi.mocked(spotRepository.findById).mockResolvedValue(mockSpot);
      vi.mocked(spotRepository.update).mockResolvedValue({
        ...mockSpot,
        isActive: false,
      });

      const result = await spotsService.clearSpot(userId, spotId);

      expect(spotRepository.update).toHaveBeenCalledWith(spotId, { isActive: false });
      expect(result.isActive).toBe(false);
    });

    it('should throw NotFoundError when spot not found', async () => {
      vi.mocked(spotRepository.findById).mockResolvedValue(null);

      await expect(spotsService.clearSpot(userId, spotId)).rejects.toThrow(NotFoundError);
    });

    it('should throw AuthorizationError when spot owned by different user', async () => {
      vi.mocked(spotRepository.findById).mockResolvedValue({
        ...mockSpot,
        userId: 'other-user',
      });

      await expect(spotsService.clearSpot(userId, spotId)).rejects.toThrow(AuthorizationError);
    });
  });

  describe('deleteSpot', () => {
    it('should delete spot when owned', async () => {
      vi.mocked(spotRepository.findById).mockResolvedValue(mockSpot);
      vi.mocked(spotRepository.delete).mockResolvedValue(true);

      await spotsService.deleteSpot(userId, spotId);

      expect(spotRepository.delete).toHaveBeenCalledWith(spotId);
    });

    it('should throw NotFoundError when spot not found', async () => {
      vi.mocked(spotRepository.findById).mockResolvedValue(null);

      await expect(spotsService.deleteSpot(userId, spotId)).rejects.toThrow(NotFoundError);
    });

    it('should throw AuthorizationError when spot owned by different user', async () => {
      vi.mocked(spotRepository.findById).mockResolvedValue({
        ...mockSpot,
        userId: 'other-user',
      });

      await expect(spotsService.deleteSpot(userId, spotId)).rejects.toThrow(AuthorizationError);
    });
  });
});
