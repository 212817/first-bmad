// apps/web/src/services/storage/types.ts

/**
 * Database store names
 */
export const STORES = {
  spots: 'spots',
  settings: 'settings',
  guestSession: 'guestSession',
} as const;

export type StoreName = (typeof STORES)[keyof typeof STORES];

/**
 * Guest session data stored in IndexedDB
 */
export interface GuestSessionData {
  isGuest: boolean;
  guestSessionId: string | null;
  createdAt: number;
}

/**
 * App settings stored in IndexedDB
 */
export interface SettingsData {
  signInPromptDismissed?: boolean;
  signInPromptLastShown?: number;
  guestVisitCount?: number;
}

/**
 * IndexedDB service interface
 */
export interface IndexedDbService {
  db: IDBDatabase | null;
  init: () => Promise<void>;
  getItem: <T>(store: StoreName, key: string) => Promise<T | null>;
  setItem: <T>(store: StoreName, key: string, value: T) => Promise<void>;
  deleteItem: (store: StoreName, key: string) => Promise<void>;
  getAllItems: <T>(store: StoreName) => Promise<T[]>;
  clearStore: (store: StoreName) => Promise<void>;
  isAvailable: () => boolean;
}
