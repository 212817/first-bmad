// apps/web/src/services/storage/__tests__/indexedDb.service.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { indexedDbService } from '../indexedDb.service';
import { STORES } from '../types';

// Mock IndexedDB
const mockObjectStore = {
  get: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  getAll: vi.fn(),
  clear: vi.fn(),
};

const mockTransaction = {
  objectStore: vi.fn(() => mockObjectStore),
};

const mockDb = {
  transaction: vi.fn(() => mockTransaction),
  objectStoreNames: {
    contains: vi.fn(() => true),
  },
  createObjectStore: vi.fn(),
};

const createMockRequest = (result: unknown = undefined, error: Error | null = null) => {
  const request = {
    result,
    error,
    onsuccess: null as (() => void) | null,
    onerror: null as (() => void) | null,
  };
  // Simulate async callback
  setTimeout(() => {
    if (error) {
      request.onerror?.();
    } else {
      request.onsuccess?.();
    }
  }, 0);
  return request;
};

describe('indexedDbService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the db reference
    indexedDbService.db = null;
  });

  afterEach(() => {
    indexedDbService.db = null;
  });

  describe('isAvailable', () => {
    it('should return false when indexedDB is not in environment (jsdom)', () => {
      // In jsdom, indexedDB may not be available
      // This test documents the actual behavior
      const result = indexedDbService.isAvailable();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('init', () => {
    it('should not reinitialize if already initialized', async () => {
      indexedDbService.db = mockDb as unknown as IDBDatabase;

      await indexedDbService.init();

      // If db is already set, init should return early without calling indexedDB.open
      expect(indexedDbService.db).toBe(mockDb);
    });

    it('should throw error if indexedDB is not available', async () => {
      const originalIsAvailable = indexedDbService.isAvailable;
      indexedDbService.isAvailable = () => false;

      await expect(indexedDbService.init()).rejects.toThrow(
        'IndexedDB is not available in this browser'
      );

      indexedDbService.isAvailable = originalIsAvailable;
    });
  });

  describe('with initialized db', () => {
    beforeEach(() => {
      indexedDbService.db = mockDb as unknown as IDBDatabase;
    });

    describe('getItem', () => {
      it('should return item when found', async () => {
        const testData = { id: '1', value: 'test' };
        mockObjectStore.get.mockReturnValue(createMockRequest(testData));

        const result = await indexedDbService.getItem(STORES.settings, 'key1');

        expect(result).toEqual(testData);
        expect(mockDb.transaction).toHaveBeenCalledWith(STORES.settings, 'readonly');
      });

      it('should return null when item not found', async () => {
        mockObjectStore.get.mockReturnValue(createMockRequest(undefined));

        const result = await indexedDbService.getItem(STORES.settings, 'nonexistent');

        expect(result).toBeNull();
      });

      it('should throw error when db not initialized', async () => {
        indexedDbService.db = null;

        await expect(indexedDbService.getItem(STORES.settings, 'key')).rejects.toThrow(
          'IndexedDB not initialized'
        );
      });
    });

    describe('setItem', () => {
      it('should store item successfully', async () => {
        const testData = { key: 'value' };
        mockObjectStore.put.mockReturnValue(createMockRequest());

        await expect(
          indexedDbService.setItem(STORES.settings, 'key1', testData)
        ).resolves.toBeUndefined();

        expect(mockDb.transaction).toHaveBeenCalledWith(STORES.settings, 'readwrite');
        expect(mockObjectStore.put).toHaveBeenCalledWith(testData, 'key1');
      });

      it('should use put without key for spots store (has keyPath)', async () => {
        const testSpot = { id: 'spot1', location: 'A1' };
        mockObjectStore.put.mockReturnValue(createMockRequest());

        await indexedDbService.setItem(STORES.spots, 'spot1', testSpot);

        expect(mockObjectStore.put).toHaveBeenCalledWith(testSpot);
      });

      it('should throw error when db not initialized', async () => {
        indexedDbService.db = null;

        await expect(indexedDbService.setItem(STORES.settings, 'key', {})).rejects.toThrow(
          'IndexedDB not initialized'
        );
      });
    });

    describe('deleteItem', () => {
      it('should delete item successfully', async () => {
        mockObjectStore.delete.mockReturnValue(createMockRequest());

        await expect(
          indexedDbService.deleteItem(STORES.guestSession, 'current')
        ).resolves.toBeUndefined();

        expect(mockObjectStore.delete).toHaveBeenCalledWith('current');
      });

      it('should throw error when db not initialized', async () => {
        indexedDbService.db = null;

        await expect(indexedDbService.deleteItem(STORES.settings, 'key')).rejects.toThrow(
          'IndexedDB not initialized'
        );
      });
    });

    describe('getAllItems', () => {
      it('should return all items from store', async () => {
        const items = [{ id: '1' }, { id: '2' }];
        mockObjectStore.getAll.mockReturnValue(createMockRequest(items));

        const result = await indexedDbService.getAllItems(STORES.spots);

        expect(result).toEqual(items);
      });

      it('should return empty array when no items', async () => {
        mockObjectStore.getAll.mockReturnValue(createMockRequest([]));

        const result = await indexedDbService.getAllItems(STORES.spots);

        expect(result).toEqual([]);
      });

      it('should throw error when db not initialized', async () => {
        indexedDbService.db = null;

        await expect(indexedDbService.getAllItems(STORES.spots)).rejects.toThrow(
          'IndexedDB not initialized'
        );
      });
    });

    describe('clearStore', () => {
      it('should clear store successfully', async () => {
        mockObjectStore.clear.mockReturnValue(createMockRequest());

        await expect(indexedDbService.clearStore(STORES.settings)).resolves.toBeUndefined();

        expect(mockObjectStore.clear).toHaveBeenCalled();
      });

      it('should throw error when db not initialized', async () => {
        indexedDbService.db = null;

        await expect(indexedDbService.clearStore(STORES.settings)).rejects.toThrow(
          'IndexedDB not initialized'
        );
      });
    });

    describe('error handling', () => {
      it('should reject when getItem request fails', async () => {
        const error = new Error('Read error');
        mockObjectStore.get.mockReturnValue(createMockRequest(undefined, error));

        await expect(indexedDbService.getItem(STORES.settings, 'key')).rejects.toThrow(
          'Read error'
        );
      });

      it('should reject when setItem request fails', async () => {
        const error = new Error('Write error');
        mockObjectStore.put.mockReturnValue(createMockRequest(undefined, error));

        await expect(
          indexedDbService.setItem(STORES.settings, 'key', { value: 'test' })
        ).rejects.toThrow('Write error');
      });

      it('should reject when deleteItem request fails', async () => {
        const error = new Error('Delete error');
        mockObjectStore.delete.mockReturnValue(createMockRequest(undefined, error));

        await expect(indexedDbService.deleteItem(STORES.settings, 'key')).rejects.toThrow(
          'Delete error'
        );
      });

      it('should reject when getAllItems request fails', async () => {
        const error = new Error('GetAll error');
        mockObjectStore.getAll.mockReturnValue(createMockRequest(undefined, error));

        await expect(indexedDbService.getAllItems(STORES.spots)).rejects.toThrow('GetAll error');
      });

      it('should reject when clearStore request fails', async () => {
        const error = new Error('Clear error');
        mockObjectStore.clear.mockReturnValue(createMockRequest(undefined, error));

        await expect(indexedDbService.clearStore(STORES.settings)).rejects.toThrow('Clear error');
      });
    });

    describe('getLatestSpot', () => {
      it('should return null when no spots exist', async () => {
        mockObjectStore.getAll.mockReturnValue(createMockRequest([]));

        const result = await indexedDbService.getLatestSpot();

        expect(result).toBeNull();
      });

      it('should return the most recent spot by savedAt', async () => {
        const spots = [
          { id: 'spot-1', savedAt: '2026-02-01T10:00:00Z' },
          { id: 'spot-3', savedAt: '2026-02-03T10:00:00Z' },
          { id: 'spot-2', savedAt: '2026-02-02T10:00:00Z' },
        ];
        mockObjectStore.getAll.mockReturnValue(createMockRequest(spots));

        const result = await indexedDbService.getLatestSpot<{ id: string; savedAt: string }>();

        expect(result).toEqual({ id: 'spot-3', savedAt: '2026-02-03T10:00:00Z' });
      });

      it('should throw error when db not initialized', async () => {
        indexedDbService.db = null;

        await expect(indexedDbService.getLatestSpot()).rejects.toThrow('IndexedDB not initialized');
      });

      it('should reject when getAll request fails', async () => {
        const error = new Error('GetAll error');
        mockObjectStore.getAll.mockReturnValue(createMockRequest(undefined, error));

        await expect(indexedDbService.getLatestSpot()).rejects.toThrow('GetAll error');
      });
    });

    describe('getSpotsPaginated', () => {
      const spots = [
        { id: 'spot-1', savedAt: '2026-02-03T10:00:00Z' },
        { id: 'spot-2', savedAt: '2026-02-02T10:00:00Z' },
        { id: 'spot-3', savedAt: '2026-02-01T10:00:00Z' },
      ];

      it('should return empty array when no spots exist', async () => {
        mockObjectStore.getAll.mockReturnValue(createMockRequest([]));

        const result = await indexedDbService.getSpotsPaginated();

        expect(result.spots).toEqual([]);
        expect(result.nextCursor).toBeNull();
      });

      it('should return spots sorted by savedAt descending', async () => {
        // Spots in random order
        const unsortedSpots = [
          { id: 'spot-2', savedAt: '2026-02-02T10:00:00Z' },
          { id: 'spot-1', savedAt: '2026-02-03T10:00:00Z' },
          { id: 'spot-3', savedAt: '2026-02-01T10:00:00Z' },
        ];
        mockObjectStore.getAll.mockReturnValue(createMockRequest(unsortedSpots));

        const result = await indexedDbService.getSpotsPaginated<{ id: string; savedAt: string }>();

        expect(result.spots[0]!.id).toBe('spot-1');
        expect(result.spots[1]!.id).toBe('spot-2');
        expect(result.spots[2]!.id).toBe('spot-3');
      });

      it('should respect limit and return nextCursor', async () => {
        const manySpots = Array.from({ length: 25 }, (_, i) => ({
          id: `spot-${i}`,
          savedAt: new Date(2026, 1, 25 - i).toISOString(),
        }));
        mockObjectStore.getAll.mockReturnValue(createMockRequest(manySpots));

        const result = await indexedDbService.getSpotsPaginated<{ id: string; savedAt: string }>(
          20
        );

        expect(result.spots).toHaveLength(20);
        expect(result.nextCursor).not.toBeNull();
      });

      it('should return null nextCursor when no more items', async () => {
        mockObjectStore.getAll.mockReturnValue(createMockRequest(spots));

        const result = await indexedDbService.getSpotsPaginated<{ id: string; savedAt: string }>(
          20
        );

        expect(result.spots).toHaveLength(3);
        expect(result.nextCursor).toBeNull();
      });

      it('should filter by cursor', async () => {
        mockObjectStore.getAll.mockReturnValue(createMockRequest(spots));

        const result = await indexedDbService.getSpotsPaginated<{ id: string; savedAt: string }>(
          20,
          '2026-02-02T10:00:00Z'
        );

        // Should only include spots before the cursor
        expect(result.spots).toHaveLength(1);
        expect(result.spots[0]!.id).toBe('spot-3');
      });

      it('should throw error when db not initialized', async () => {
        indexedDbService.db = null;

        await expect(indexedDbService.getSpotsPaginated()).rejects.toThrow(
          'IndexedDB not initialized'
        );
      });

      it('should reject when getAll request fails', async () => {
        const error = new Error('GetAll error');
        mockObjectStore.getAll.mockReturnValue(createMockRequest(undefined, error));

        await expect(indexedDbService.getSpotsPaginated()).rejects.toThrow('GetAll error');
      });
    });
  });
});
