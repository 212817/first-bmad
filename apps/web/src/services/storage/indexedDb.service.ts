// apps/web/src/services/storage/indexedDb.service.ts
import { STORES, type StoreName, type IndexedDbService } from './types';

const DB_NAME = 'wdip-local';
const DB_VERSION = 1;

/**
 * IndexedDB storage service for local data persistence
 * Used for guest mode data and offline support
 */
export const indexedDbService: IndexedDbService = {
  db: null,

  /**
   * Initialize the IndexedDB database
   * Creates object stores if they don't exist
   */
  init: async (): Promise<void> => {
    if (indexedDbService.db) {
      return;
    }

    if (!indexedDbService.isAvailable()) {
      throw new Error('IndexedDB is not available in this browser');
    }

    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        reject(new Error(`Failed to open IndexedDB: ${request.error?.message}`));
      };

      request.onsuccess = () => {
        indexedDbService.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains(STORES.spots)) {
          db.createObjectStore(STORES.spots, { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains(STORES.settings)) {
          db.createObjectStore(STORES.settings);
        }
        if (!db.objectStoreNames.contains(STORES.guestSession)) {
          db.createObjectStore(STORES.guestSession);
        }
      };
    });
  },

  /**
   * Get an item from a store by key
   */
  getItem: async <T>(store: StoreName, key: string): Promise<T | null> => {
    if (!indexedDbService.db) {
      throw new Error('IndexedDB not initialized. Call init() first.');
    }

    return new Promise((resolve, reject) => {
      const transaction = indexedDbService.db!.transaction(store, 'readonly');
      const objectStore = transaction.objectStore(store);
      const request = objectStore.get(key);

      request.onerror = () => {
        reject(new Error(`Failed to get item from ${store}: ${request.error?.message}`));
      };

      request.onsuccess = () => {
        resolve(request.result ?? null);
      };
    });
  },

  /**
   * Set an item in a store
   */
  setItem: async <T>(store: StoreName, key: string, value: T): Promise<void> => {
    if (!indexedDbService.db) {
      throw new Error('IndexedDB not initialized. Call init() first.');
    }

    return new Promise((resolve, reject) => {
      const transaction = indexedDbService.db!.transaction(store, 'readwrite');
      const objectStore = transaction.objectStore(store);

      // For stores with keyPath, use put directly
      // For stores without keyPath, use put with key
      const request = store === STORES.spots ? objectStore.put(value) : objectStore.put(value, key);

      request.onerror = () => {
        reject(new Error(`Failed to set item in ${store}: ${request.error?.message}`));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  },

  /**
   * Delete an item from a store by key
   */
  deleteItem: async (store: StoreName, key: string): Promise<void> => {
    if (!indexedDbService.db) {
      throw new Error('IndexedDB not initialized. Call init() first.');
    }

    return new Promise((resolve, reject) => {
      const transaction = indexedDbService.db!.transaction(store, 'readwrite');
      const objectStore = transaction.objectStore(store);
      const request = objectStore.delete(key);

      request.onerror = () => {
        reject(new Error(`Failed to delete item from ${store}: ${request.error?.message}`));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  },

  /**
   * Get all items from a store
   */
  getAllItems: async <T>(store: StoreName): Promise<T[]> => {
    if (!indexedDbService.db) {
      throw new Error('IndexedDB not initialized. Call init() first.');
    }

    return new Promise((resolve, reject) => {
      const transaction = indexedDbService.db!.transaction(store, 'readonly');
      const objectStore = transaction.objectStore(store);
      const request = objectStore.getAll();

      request.onerror = () => {
        reject(new Error(`Failed to get all items from ${store}: ${request.error?.message}`));
      };

      request.onsuccess = () => {
        resolve(request.result ?? []);
      };
    });
  },

  /**
   * Clear all items from a store
   */
  clearStore: async (store: StoreName): Promise<void> => {
    if (!indexedDbService.db) {
      throw new Error('IndexedDB not initialized. Call init() first.');
    }

    return new Promise((resolve, reject) => {
      const transaction = indexedDbService.db!.transaction(store, 'readwrite');
      const objectStore = transaction.objectStore(store);
      const request = objectStore.clear();

      request.onerror = () => {
        reject(new Error(`Failed to clear store ${store}: ${request.error?.message}`));
      };

      request.onsuccess = () => {
        resolve();
      };
    });
  },

  /**
   * Check if IndexedDB is available in the current browser
   */
  isAvailable: (): boolean => {
    return typeof indexedDB !== 'undefined';
  },
};
