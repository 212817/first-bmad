// apps/web/src/stores/__tests__/spotStore.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useSpotStore } from '../spotStore';
import { useGuestStore } from '../guestStore';
import { apiClient } from '@/services/api/client';
import { indexedDbService } from '@/services/storage/indexedDb.service';

// Mock dependencies
vi.mock('@/services/api/client', () => ({
  apiClient: {
    post: vi.fn(),
  },
}));

vi.mock('@/services/storage/indexedDb.service', () => ({
  indexedDbService: {
    setItem: vi.fn(),
    getItem: vi.fn(),
  },
}));

vi.mock('../guestStore', () => ({
  useGuestStore: {
    getState: vi.fn(() => ({ isGuest: false })),
  },
}));

// Mock crypto.randomUUID
const mockUUID = 'test-uuid-1234';
vi.stubGlobal('crypto', {
  randomUUID: () => mockUUID,
});

describe('spotStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store state
    useSpotStore.setState({
      currentSpot: null,
      isLoading: false,
      isSaving: false,
      error: null,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useSpotStore.getState();

      expect(state.currentSpot).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.isSaving).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('saveSpot - authenticated user', () => {
    const mockPosition = {
      lat: 40.7128,
      lng: -74.006,
      accuracy: 15,
    };

    const mockApiSpot = {
      id: 'api-spot-id',
      lat: 40.7128,
      lng: -74.006,
      accuracyMeters: 15,
      address: null,
      photoUrl: null,
      note: null,
      floor: null,
      spotIdentifier: null,
      isActive: true,
      savedAt: '2026-01-15T12:00:00Z',
    };

    beforeEach(() => {
      vi.mocked(useGuestStore.getState).mockReturnValue({ isGuest: false } as ReturnType<
        typeof useGuestStore.getState
      >);
    });

    it('should set isSaving to true while saving', async () => {
      vi.mocked(apiClient.post).mockImplementation(() => new Promise(() => {})); // Never resolves

      void useSpotStore.getState().saveSpot(mockPosition);

      expect(useSpotStore.getState().isSaving).toBe(true);
      expect(useSpotStore.getState().error).toBeNull();
    });

    it('should call API and set currentSpot on success', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        data: { success: true, data: mockApiSpot },
      });

      const result = await useSpotStore.getState().saveSpot(mockPosition);

      expect(apiClient.post).toHaveBeenCalledWith('/v1/spots', {
        lat: 40.7128,
        lng: -74.006,
        accuracyMeters: 15,
      });
      expect(result).toEqual(mockApiSpot);
      expect(useSpotStore.getState().currentSpot).toEqual(mockApiSpot);
      expect(useSpotStore.getState().isSaving).toBe(false);
    });

    it('should set error on API failure', async () => {
      vi.mocked(apiClient.post).mockRejectedValue(new Error('Network error'));

      await expect(useSpotStore.getState().saveSpot(mockPosition)).rejects.toThrow('Network error');

      expect(useSpotStore.getState().error).toBe('Network error');
      expect(useSpotStore.getState().isSaving).toBe(false);
      expect(useSpotStore.getState().currentSpot).toBeNull();
    });

    it('should handle non-Error rejections', async () => {
      vi.mocked(apiClient.post).mockRejectedValue('Unknown error');

      await expect(useSpotStore.getState().saveSpot(mockPosition)).rejects.toBe('Unknown error');

      expect(useSpotStore.getState().error).toBe('Failed to save spot');
      expect(useSpotStore.getState().isSaving).toBe(false);
    });
  });

  describe('saveSpot - guest user', () => {
    const mockPosition = {
      lat: 40.7128,
      lng: -74.006,
      accuracy: 15.5,
    };

    beforeEach(() => {
      vi.mocked(useGuestStore.getState).mockReturnValue({ isGuest: true } as ReturnType<
        typeof useGuestStore.getState
      >);
      vi.mocked(indexedDbService.setItem).mockResolvedValue(undefined);
    });

    it('should save to IndexedDB for guest users', async () => {
      const result = await useSpotStore.getState().saveSpot(mockPosition);

      expect(indexedDbService.setItem).toHaveBeenCalledWith(
        'spots',
        mockUUID,
        expect.objectContaining({
          id: mockUUID,
          lat: 40.7128,
          lng: -74.006,
          accuracyMeters: 16, // Rounded
          isActive: true,
        })
      );
      expect(apiClient.post).not.toHaveBeenCalled();
      expect(result.id).toBe(mockUUID);
      expect(useSpotStore.getState().currentSpot).not.toBeNull();
    });

    it('should round accuracy to integer', async () => {
      await useSpotStore.getState().saveSpot({ lat: 40, lng: -74, accuracy: 15.7 });

      expect(indexedDbService.setItem).toHaveBeenCalledWith(
        'spots',
        mockUUID,
        expect.objectContaining({
          accuracyMeters: 16,
        })
      );
    });

    it('should set error on IndexedDB failure', async () => {
      vi.mocked(indexedDbService.setItem).mockRejectedValue(new Error('Storage full'));

      await expect(useSpotStore.getState().saveSpot(mockPosition)).rejects.toThrow('Storage full');

      expect(useSpotStore.getState().error).toBe('Storage full');
      expect(useSpotStore.getState().isSaving).toBe(false);
    });
  });

  describe('clearSpot', () => {
    it('should clear currentSpot and error', () => {
      useSpotStore.setState({
        currentSpot: { id: 'test' } as any,
        error: 'Some error',
      });

      useSpotStore.getState().clearSpot();

      expect(useSpotStore.getState().currentSpot).toBeNull();
      expect(useSpotStore.getState().error).toBeNull();
    });
  });

  describe('setLoading', () => {
    it('should set loading state to true', () => {
      useSpotStore.getState().setLoading(true);

      expect(useSpotStore.getState().isLoading).toBe(true);
    });

    it('should set loading state to false', () => {
      useSpotStore.setState({ isLoading: true });
      useSpotStore.getState().setLoading(false);

      expect(useSpotStore.getState().isLoading).toBe(false);
    });
  });

  describe('setError', () => {
    it('should set error message', () => {
      useSpotStore.getState().setError('Test error');

      expect(useSpotStore.getState().error).toBe('Test error');
    });

    it('should clear error when set to null', () => {
      useSpotStore.setState({ error: 'Previous error' });
      useSpotStore.getState().setError(null);

      expect(useSpotStore.getState().error).toBeNull();
    });
  });
});
