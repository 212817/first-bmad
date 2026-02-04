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
    patch: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('@/services/storage/indexedDb.service', () => ({
  indexedDbService: {
    setItem: vi.fn(),
    getItem: vi.fn(),
    getLatestSpot: vi.fn(),
    getSpotsPaginated: vi.fn(),
    deleteItem: vi.fn(),
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
      latestSpot: null,
      isLoading: false,
      isLoadingLatest: false,
      isSaving: false,
      error: null,
      spots: [],
      hasMore: true,
      nextCursor: null,
      isLoadingSpots: false,
      isLoadingMore: false,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useSpotStore.getState();

      expect(state.currentSpot).toBeNull();
      expect(state.latestSpot).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.isLoadingLatest).toBe(false);
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

  describe('updateSpot - authenticated user', () => {
    const existingSpot = {
      id: 'spot-123',
      carTagId: null,
      lat: 40.7128,
      lng: -74.006,
      accuracyMeters: 15,
      address: null,
      photoUrl: null,
      note: null,
      floor: null,
      spotIdentifier: null,
      isActive: true,
      savedAt: '2024-01-15T12:00:00Z',
    };

    beforeEach(() => {
      vi.mocked(useGuestStore.getState).mockReturnValue({ isGuest: false } as ReturnType<
        typeof useGuestStore.getState
      >);
      useSpotStore.setState({ currentSpot: existingSpot });
    });

    it('should set isSaving to true while updating', async () => {
      const updatedSpot = { ...existingSpot, photoUrl: 'https://example.com/photo.jpg' };
      vi.mocked(apiClient.patch).mockResolvedValue({
        data: { success: true, data: updatedSpot },
      });

      const updatePromise = useSpotStore
        .getState()
        .updateSpot('spot-123', { photoUrl: 'https://example.com/photo.jpg' });
      expect(useSpotStore.getState().isSaving).toBe(true);

      await updatePromise;
      expect(useSpotStore.getState().isSaving).toBe(false);
    });

    it('should call API and update currentSpot on success', async () => {
      const updatedSpot = { ...existingSpot, photoUrl: 'https://example.com/photo.jpg' };
      vi.mocked(apiClient.patch).mockResolvedValue({
        data: { success: true, data: updatedSpot },
      });

      const result = await useSpotStore
        .getState()
        .updateSpot('spot-123', { photoUrl: 'https://example.com/photo.jpg' });

      expect(apiClient.patch).toHaveBeenCalledWith('/v1/spots/spot-123', {
        photoUrl: 'https://example.com/photo.jpg',
      });
      expect(result).toEqual(updatedSpot);
      expect(useSpotStore.getState().currentSpot).toEqual(updatedSpot);
    });

    it('should set error on API failure', async () => {
      vi.mocked(apiClient.patch).mockRejectedValue(new Error('Network error'));

      await expect(
        useSpotStore.getState().updateSpot('spot-123', { photoUrl: 'test' })
      ).rejects.toThrow('Network error');

      expect(useSpotStore.getState().error).toBe('Network error');
      expect(useSpotStore.getState().isSaving).toBe(false);
    });
  });

  describe('updateSpot - guest user', () => {
    const existingSpot = {
      id: 'spot-123',
      carTagId: null,
      lat: 40.7128,
      lng: -74.006,
      accuracyMeters: 15,
      address: null,
      photoUrl: null,
      note: null,
      floor: null,
      spotIdentifier: null,
      isActive: true,
      savedAt: '2024-01-15T12:00:00Z',
    };

    beforeEach(() => {
      vi.mocked(useGuestStore.getState).mockReturnValue({ isGuest: true } as ReturnType<
        typeof useGuestStore.getState
      >);
      useSpotStore.setState({ currentSpot: existingSpot });
    });

    it('should update in IndexedDB for guest users', async () => {
      vi.mocked(indexedDbService.getItem).mockResolvedValue(existingSpot);
      vi.mocked(indexedDbService.setItem).mockResolvedValue(undefined);

      const result = await useSpotStore
        .getState()
        .updateSpot('spot-123', { photoUrl: 'https://example.com/photo.jpg' });

      expect(indexedDbService.getItem).toHaveBeenCalledWith('spots', 'spot-123');
      expect(indexedDbService.setItem).toHaveBeenCalledWith(
        'spots',
        'spot-123',
        expect.objectContaining({
          ...existingSpot,
          photoUrl: 'https://example.com/photo.jpg',
        })
      );
      expect(apiClient.patch).not.toHaveBeenCalled();
      expect(result.photoUrl).toBe('https://example.com/photo.jpg');
    });

    it('should throw error if spot not found in IndexedDB', async () => {
      vi.mocked(indexedDbService.getItem).mockResolvedValue(null);

      await expect(
        useSpotStore.getState().updateSpot('spot-123', { photoUrl: 'test' })
      ).rejects.toThrow('Spot not found');

      expect(useSpotStore.getState().error).toBe('Spot not found');
    });
  });

  describe('fetchLatestSpot - authenticated user', () => {
    const mockLatestSpot = {
      id: 'spot-latest',
      carTagId: 'tag-1',
      lat: 40.7128,
      lng: -74.006,
      accuracyMeters: 10,
      address: 'Near Central Park',
      photoUrl: 'https://example.com/photo.jpg',
      note: 'Level P2',
      floor: null,
      spotIdentifier: null,
      isActive: true,
      savedAt: '2026-02-03T10:00:00Z',
    };

    beforeEach(() => {
      vi.mocked(useGuestStore.getState).mockReturnValue({ isGuest: false } as ReturnType<
        typeof useGuestStore.getState
      >);
    });

    it('should set isLoadingLatest to true while fetching', async () => {
      vi.mocked(apiClient.get).mockImplementation(() => new Promise(() => {})); // Never resolves

      void useSpotStore.getState().fetchLatestSpot();

      expect(useSpotStore.getState().isLoadingLatest).toBe(true);
      expect(useSpotStore.getState().error).toBeNull();
    });

    it('should call API and set latestSpot on success', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { success: true, data: mockLatestSpot },
      });

      const result = await useSpotStore.getState().fetchLatestSpot();

      expect(apiClient.get).toHaveBeenCalledWith('/v1/spots/latest');
      expect(result).toEqual(mockLatestSpot);
      expect(useSpotStore.getState().latestSpot).toEqual(mockLatestSpot);
      expect(useSpotStore.getState().isLoadingLatest).toBe(false);
    });

    it('should set latestSpot to null when API returns 404', async () => {
      const error = new Error('Not Found') as Error & { response?: { status: number } };
      error.response = { status: 404 };
      vi.mocked(apiClient.get).mockRejectedValue(error);

      const result = await useSpotStore.getState().fetchLatestSpot();

      expect(result).toBeNull();
      expect(useSpotStore.getState().latestSpot).toBeNull();
      expect(useSpotStore.getState().isLoadingLatest).toBe(false);
      expect(useSpotStore.getState().error).toBeNull();
    });

    it('should set error on API failure (non-404)', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Network error'));

      await expect(useSpotStore.getState().fetchLatestSpot()).rejects.toThrow('Network error');

      expect(useSpotStore.getState().error).toBe('Network error');
      expect(useSpotStore.getState().isLoadingLatest).toBe(false);
    });
  });

  describe('fetchLatestSpot - guest user', () => {
    const mockLatestSpot = {
      id: 'guest-spot',
      carTagId: null,
      lat: 40.7128,
      lng: -74.006,
      accuracyMeters: 15,
      address: null,
      photoUrl: null,
      note: null,
      floor: null,
      spotIdentifier: null,
      isActive: true,
      savedAt: '2026-02-03T10:00:00Z',
    };

    beforeEach(() => {
      vi.mocked(useGuestStore.getState).mockReturnValue({ isGuest: true } as ReturnType<
        typeof useGuestStore.getState
      >);
    });

    it('should get from IndexedDB for guest users', async () => {
      vi.mocked(indexedDbService.getLatestSpot).mockResolvedValue(mockLatestSpot);

      const result = await useSpotStore.getState().fetchLatestSpot();

      expect(indexedDbService.getLatestSpot).toHaveBeenCalled();
      expect(apiClient.get).not.toHaveBeenCalled();
      expect(result).toEqual(mockLatestSpot);
      expect(useSpotStore.getState().latestSpot).toEqual(mockLatestSpot);
    });

    it('should return null when no spots in IndexedDB', async () => {
      vi.mocked(indexedDbService.getLatestSpot).mockResolvedValue(null);

      const result = await useSpotStore.getState().fetchLatestSpot();

      expect(result).toBeNull();
      expect(useSpotStore.getState().latestSpot).toBeNull();
    });
  });

  describe('saveSpot - updates latestSpot', () => {
    const mockPosition = {
      lat: 40.7128,
      lng: -74.006,
      accuracy: 15,
    };

    const mockApiSpot = {
      id: 'new-spot-id',
      lat: 40.7128,
      lng: -74.006,
      accuracyMeters: 15,
      address: null,
      photoUrl: null,
      note: null,
      floor: null,
      spotIdentifier: null,
      isActive: true,
      savedAt: '2026-02-03T12:00:00Z',
    };

    beforeEach(() => {
      vi.mocked(useGuestStore.getState).mockReturnValue({ isGuest: false } as ReturnType<
        typeof useGuestStore.getState
      >);
    });

    it('should update latestSpot after saving a new spot', async () => {
      vi.mocked(apiClient.post).mockResolvedValue({
        data: { success: true, data: mockApiSpot },
      });

      await useSpotStore.getState().saveSpot(mockPosition);

      expect(useSpotStore.getState().latestSpot).toEqual(mockApiSpot);
      expect(useSpotStore.getState().currentSpot).toEqual(mockApiSpot);
    });
  });

  describe('fetchSpots', () => {
    const mockSpots = [
      {
        id: 'spot-1',
        lat: 40.7128,
        lng: -74.006,
        address: '123 Main St',
        savedAt: '2026-02-03T12:00:00Z',
      },
      {
        id: 'spot-2',
        lat: 40.7129,
        lng: -74.007,
        address: '456 Oak Ave',
        savedAt: '2026-02-02T12:00:00Z',
      },
    ];

    describe('authenticated user', () => {
      beforeEach(() => {
        vi.mocked(useGuestStore.getState).mockReturnValue({ isGuest: false } as ReturnType<
          typeof useGuestStore.getState
        >);
      });

      it('should fetch spots from API', async () => {
        vi.mocked(apiClient.get).mockResolvedValue({
          data: {
            success: true,
            data: mockSpots,
            meta: { limit: 20, nextCursor: null },
          },
        });

        await useSpotStore.getState().fetchSpots();

        expect(apiClient.get).toHaveBeenCalledWith('/v1/spots?limit=20');
        expect(useSpotStore.getState().spots).toEqual(mockSpots);
        expect(useSpotStore.getState().hasMore).toBe(false);
        expect(useSpotStore.getState().nextCursor).toBeNull();
      });

      it('should handle pagination with cursor', async () => {
        vi.mocked(apiClient.get).mockResolvedValue({
          data: {
            success: true,
            data: mockSpots,
            meta: { limit: 20, nextCursor: '2026-02-01T12:00:00Z' },
          },
        });

        await useSpotStore.getState().fetchSpots();

        expect(useSpotStore.getState().hasMore).toBe(true);
        expect(useSpotStore.getState().nextCursor).toBe('2026-02-01T12:00:00Z');
      });

      it('should set loading states correctly', async () => {
        vi.mocked(apiClient.get).mockImplementation(() => {
          expect(useSpotStore.getState().isLoadingSpots).toBe(true);
          return Promise.resolve({
            data: { success: true, data: [], meta: { limit: 20, nextCursor: null } },
          });
        });

        await useSpotStore.getState().fetchSpots();

        expect(useSpotStore.getState().isLoadingSpots).toBe(false);
      });
    });

    describe('guest user', () => {
      beforeEach(() => {
        vi.mocked(useGuestStore.getState).mockReturnValue({ isGuest: true } as ReturnType<
          typeof useGuestStore.getState
        >);
      });

      it('should fetch spots from IndexedDB', async () => {
        vi.mocked(indexedDbService.getSpotsPaginated).mockResolvedValue({
          spots: mockSpots,
          nextCursor: null,
        });

        await useSpotStore.getState().fetchSpots();

        expect(indexedDbService.getSpotsPaginated).toHaveBeenCalledWith(20, undefined);
        expect(useSpotStore.getState().spots).toEqual(mockSpots);
      });
    });
  });

  describe('loadMore', () => {
    beforeEach(() => {
      vi.mocked(useGuestStore.getState).mockReturnValue({ isGuest: false } as ReturnType<
        typeof useGuestStore.getState
      >);
    });

    it('should not load more when hasMore is false', async () => {
      useSpotStore.setState({ hasMore: false, nextCursor: null });

      await useSpotStore.getState().loadMore();

      expect(apiClient.get).not.toHaveBeenCalled();
    });

    it('should not load more when already loading', async () => {
      useSpotStore.setState({ hasMore: true, isLoadingMore: true });

      await useSpotStore.getState().loadMore();

      expect(apiClient.get).not.toHaveBeenCalled();
    });

    it('should load more with cursor', async () => {
      useSpotStore.setState({
        hasMore: true,
        nextCursor: '2026-02-01T12:00:00Z',
        spots: [{ id: 'existing' }] as any,
      });

      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          success: true,
          data: [{ id: 'new-spot' }],
          meta: { limit: 20, nextCursor: null },
        },
      });

      await useSpotStore.getState().loadMore();

      expect(apiClient.get).toHaveBeenCalledWith(
        '/v1/spots?limit=20&cursor=2026-02-01T12%3A00%3A00Z'
      );
      expect(useSpotStore.getState().spots).toHaveLength(2);
    });
  });

  describe('clearHistory', () => {
    it('should reset history state', () => {
      useSpotStore.setState({
        spots: [{ id: 'spot-1' }] as any,
        hasMore: false,
        nextCursor: 'some-cursor',
        isLoadingSpots: true,
        isLoadingMore: true,
      });

      useSpotStore.getState().clearHistory();

      expect(useSpotStore.getState().spots).toEqual([]);
      expect(useSpotStore.getState().hasMore).toBe(true);
      expect(useSpotStore.getState().nextCursor).toBeNull();
      expect(useSpotStore.getState().isLoadingSpots).toBe(false);
      expect(useSpotStore.getState().isLoadingMore).toBe(false);
    });
  });

  describe('deleteSpot - authenticated user', () => {
    const mockSpot = {
      id: 'spot-123',
      carTagId: null,
      lat: 40.7128,
      lng: -74.006,
      accuracyMeters: 10,
      address: '123 Main St',
      photoUrl: null,
      note: null,
      floor: null,
      spotIdentifier: null,
      isActive: true,
      savedAt: '2026-01-15T12:00:00Z',
    };

    beforeEach(() => {
      vi.mocked(useGuestStore.getState).mockReturnValue({ isGuest: false } as any);
    });

    it('should delete spot via API', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({ status: 204 });

      useSpotStore.setState({
        spots: [mockSpot],
        latestSpot: mockSpot,
      });

      const result = await useSpotStore.getState().deleteSpot('spot-123');

      expect(result).toBe(true);
      expect(apiClient.delete).toHaveBeenCalledWith('/v1/spots/spot-123');
      expect(useSpotStore.getState().spots).toEqual([]);
    });

    it('should update latestSpot when deleted spot was latest', async () => {
      const anotherSpot = { ...mockSpot, id: 'spot-456' };
      vi.mocked(apiClient.delete).mockResolvedValue({ status: 204 });

      useSpotStore.setState({
        spots: [mockSpot, anotherSpot],
        latestSpot: mockSpot,
      });

      await useSpotStore.getState().deleteSpot('spot-123');

      expect(useSpotStore.getState().latestSpot).toEqual(anotherSpot);
    });

    it('should clear latestSpot when last spot deleted', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({ status: 204 });

      useSpotStore.setState({
        spots: [mockSpot],
        latestSpot: mockSpot,
      });

      await useSpotStore.getState().deleteSpot('spot-123');

      expect(useSpotStore.getState().latestSpot).toBeNull();
    });

    it('should clear currentSpot if deleted spot was current', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({ status: 204 });

      useSpotStore.setState({
        spots: [mockSpot],
        currentSpot: mockSpot,
      });

      await useSpotStore.getState().deleteSpot('spot-123');

      expect(useSpotStore.getState().currentSpot).toBeNull();
    });

    it('should return false and set error on API failure', async () => {
      vi.mocked(apiClient.delete).mockRejectedValue(new Error('Network error'));

      useSpotStore.setState({
        spots: [mockSpot],
      });

      const result = await useSpotStore.getState().deleteSpot('spot-123');

      expect(result).toBe(false);
      expect(useSpotStore.getState().error).toBe('Network error');
      // Spots should not be modified on failure
      expect(useSpotStore.getState().spots).toHaveLength(1);
    });
  });

  describe('deleteSpot - guest user', () => {
    const mockSpot = {
      id: 'spot-123',
      carTagId: null,
      lat: 40.7128,
      lng: -74.006,
      accuracyMeters: 10,
      address: '123 Main St',
      photoUrl: null,
      note: null,
      floor: null,
      spotIdentifier: null,
      isActive: true,
      savedAt: '2026-01-15T12:00:00Z',
    };

    beforeEach(() => {
      vi.mocked(useGuestStore.getState).mockReturnValue({ isGuest: true } as any);
    });

    it('should delete spot from IndexedDB', async () => {
      vi.mocked(indexedDbService.deleteItem).mockResolvedValue(undefined);

      useSpotStore.setState({
        spots: [mockSpot],
        latestSpot: mockSpot,
      });

      const result = await useSpotStore.getState().deleteSpot('spot-123');

      expect(result).toBe(true);
      expect(indexedDbService.deleteItem).toHaveBeenCalledWith('spots', 'spot-123');
      expect(useSpotStore.getState().spots).toEqual([]);
      expect(useSpotStore.getState().latestSpot).toBeNull();
    });

    it('should return false on IndexedDB failure', async () => {
      vi.mocked(indexedDbService.deleteItem).mockRejectedValue(new Error('IndexedDB error'));

      useSpotStore.setState({
        spots: [mockSpot],
      });

      const result = await useSpotStore.getState().deleteSpot('spot-123');

      expect(result).toBe(false);
      expect(useSpotStore.getState().error).toBe('IndexedDB error');
    });
  });
});
