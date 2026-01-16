// apps/web/src/stores/__tests__/guestStore.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useGuestStore } from '../guestStore';
import { indexedDbService } from '@/services/storage/indexedDb.service';
import { STORES } from '@/services/storage/types';

// Mock IndexedDB service
vi.mock('@/services/storage/indexedDb.service', () => ({
  indexedDbService: {
    init: vi.fn().mockResolvedValue(undefined),
    getItem: vi.fn().mockResolvedValue(null),
    setItem: vi.fn().mockResolvedValue(undefined),
    deleteItem: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock crypto.randomUUID
vi.stubGlobal('crypto', {
  randomUUID: vi.fn(() => 'test-uuid-1234'),
});

describe('guestStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store to initial state
    useGuestStore.setState({
      isGuest: false,
      guestSessionId: null,
      createdAt: null,
      isHydrated: false,
    });
  });

  describe('initial state', () => {
    it('should have correct initial values', () => {
      const state = useGuestStore.getState();

      expect(state.isGuest).toBe(false);
      expect(state.guestSessionId).toBeNull();
      expect(state.createdAt).toBeNull();
      expect(state.isHydrated).toBe(false);
    });
  });

  describe('enterGuestMode', () => {
    it('should set guest state and persist to IndexedDB', async () => {
      const { enterGuestMode } = useGuestStore.getState();

      await enterGuestMode();

      const state = useGuestStore.getState();
      expect(state.isGuest).toBe(true);
      expect(state.guestSessionId).toBe('test-uuid-1234');
      expect(state.createdAt).toBeGreaterThan(0);
      expect(state.isHydrated).toBe(true);

      expect(indexedDbService.setItem).toHaveBeenCalledWith(
        STORES.guestSession,
        'current',
        expect.objectContaining({
          isGuest: true,
          guestSessionId: 'test-uuid-1234',
        })
      );
    });
  });

  describe('exitGuestMode', () => {
    it('should clear guest state and remove from IndexedDB', async () => {
      // Set up guest state first
      useGuestStore.setState({
        isGuest: true,
        guestSessionId: 'test-uuid',
        createdAt: Date.now(),
        isHydrated: true,
      });

      const { exitGuestMode } = useGuestStore.getState();
      await exitGuestMode();

      const state = useGuestStore.getState();
      expect(state.isGuest).toBe(false);
      expect(state.guestSessionId).toBeNull();
      expect(state.createdAt).toBeNull();

      expect(indexedDbService.deleteItem).toHaveBeenCalledWith(STORES.guestSession, 'current');
    });
  });

  describe('hydrate', () => {
    it('should restore guest state from IndexedDB when session exists', async () => {
      const mockSession = {
        isGuest: true,
        guestSessionId: 'existing-session-id',
        createdAt: 1234567890,
      };
      vi.mocked(indexedDbService.getItem).mockResolvedValue(mockSession);

      const { hydrate } = useGuestStore.getState();
      await hydrate();

      const state = useGuestStore.getState();
      expect(state.isGuest).toBe(true);
      expect(state.guestSessionId).toBe('existing-session-id');
      expect(state.createdAt).toBe(1234567890);
      expect(state.isHydrated).toBe(true);

      expect(indexedDbService.init).toHaveBeenCalled();
      expect(indexedDbService.getItem).toHaveBeenCalledWith(STORES.guestSession, 'current');
    });

    it('should mark as hydrated when no session exists', async () => {
      vi.mocked(indexedDbService.getItem).mockResolvedValue(null);

      const { hydrate } = useGuestStore.getState();
      await hydrate();

      const state = useGuestStore.getState();
      expect(state.isGuest).toBe(false);
      expect(state.isHydrated).toBe(true);
    });

    it('should handle IndexedDB errors gracefully', async () => {
      vi.mocked(indexedDbService.init).mockRejectedValue(new Error('IndexedDB error'));
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const { hydrate } = useGuestStore.getState();
      await hydrate();

      const state = useGuestStore.getState();
      expect(state.isGuest).toBe(false);
      expect(state.isHydrated).toBe(true);
      expect(consoleSpy).toHaveBeenCalled();

      consoleSpy.mockRestore();
    });
  });
});
