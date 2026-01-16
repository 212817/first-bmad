// apps/web/src/hooks/useSignInPrompt/__tests__/useSignInPrompt.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSignInPrompt } from '../useSignInPrompt';
import { useGuestStore } from '@/stores/guestStore';
import { indexedDbService } from '@/services/storage/indexedDb.service';
import { STORES } from '@/services/storage/types';

// Mock IndexedDB service
vi.mock('@/services/storage/indexedDb.service', () => ({
  indexedDbService: {
    init: vi.fn().mockResolvedValue(undefined),
    getItem: vi.fn(),
    setItem: vi.fn().mockResolvedValue(undefined),
    deleteItem: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('useSignInPrompt', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useGuestStore.setState({
      isGuest: false,
      isHydrated: false,
      guestSessionId: null,
      createdAt: null,
    });
  });

  describe('initial state', () => {
    it('should not show prompt when not in guest mode', () => {
      const { result } = renderHook(() => useSignInPrompt());

      expect(result.current.showPrompt).toBe(false);
    });

    it('should not show prompt when not hydrated', () => {
      useGuestStore.setState({ isGuest: true, isHydrated: false });

      const { result } = renderHook(() => useSignInPrompt());

      expect(result.current.showPrompt).toBe(false);
    });
  });

  describe('visit counting', () => {
    it('should show prompt after 3rd visit', async () => {
      useGuestStore.setState({ isGuest: true, isHydrated: true });
      vi.mocked(indexedDbService.getItem).mockResolvedValue({ guestVisitCount: 2 });

      const { result } = renderHook(() => useSignInPrompt());

      await waitFor(() => {
        expect(result.current.showPrompt).toBe(true);
      });
    });

    it('should not show prompt before 3rd visit', async () => {
      useGuestStore.setState({ isGuest: true, isHydrated: true });
      vi.mocked(indexedDbService.getItem).mockResolvedValue({ guestVisitCount: 0 });

      const { result } = renderHook(() => useSignInPrompt());

      // Wait for the effect to run
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      expect(result.current.showPrompt).toBe(false);
    });

    it('should not show prompt if already dismissed', async () => {
      useGuestStore.setState({ isGuest: true, isHydrated: true });
      vi.mocked(indexedDbService.getItem).mockResolvedValue({
        guestVisitCount: 10,
        signInPromptDismissed: true,
      });

      const { result } = renderHook(() => useSignInPrompt());

      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
      });

      expect(result.current.showPrompt).toBe(false);
    });

    it('should increment visit count on load', async () => {
      useGuestStore.setState({ isGuest: true, isHydrated: true });
      vi.mocked(indexedDbService.getItem).mockResolvedValue({ guestVisitCount: 1 });

      renderHook(() => useSignInPrompt());

      await waitFor(() => {
        expect(indexedDbService.setItem).toHaveBeenCalledWith(
          STORES.settings,
          'app',
          expect.objectContaining({ guestVisitCount: 2 })
        );
      });
    });
  });

  describe('dismiss', () => {
    it('should hide prompt and persist dismissal', async () => {
      useGuestStore.setState({ isGuest: true, isHydrated: true });
      vi.mocked(indexedDbService.getItem).mockResolvedValue({ guestVisitCount: 5 });

      const { result } = renderHook(() => useSignInPrompt());

      await waitFor(() => {
        expect(result.current.showPrompt).toBe(true);
      });

      await act(async () => {
        await result.current.dismiss();
      });

      expect(result.current.showPrompt).toBe(false);
      expect(indexedDbService.setItem).toHaveBeenCalledWith(
        STORES.settings,
        'app',
        expect.objectContaining({ signInPromptDismissed: true })
      );
    });
  });

  describe('triggerAfterSpotSave', () => {
    it('should show prompt when triggered', async () => {
      useGuestStore.setState({ isGuest: true, isHydrated: true });
      vi.mocked(indexedDbService.getItem).mockResolvedValue({});

      const { result } = renderHook(() => useSignInPrompt());

      await act(async () => {
        await result.current.triggerAfterSpotSave();
      });

      expect(result.current.showPrompt).toBe(true);
    });

    it('should not show prompt if dismissed', async () => {
      useGuestStore.setState({ isGuest: true, isHydrated: true });
      vi.mocked(indexedDbService.getItem).mockResolvedValue({ signInPromptDismissed: true });

      const { result } = renderHook(() => useSignInPrompt());

      await act(async () => {
        await result.current.triggerAfterSpotSave();
      });

      expect(result.current.showPrompt).toBe(false);
    });

    it('should not show prompt if not in guest mode', async () => {
      useGuestStore.setState({ isGuest: false, isHydrated: true });

      const { result } = renderHook(() => useSignInPrompt());

      await act(async () => {
        await result.current.triggerAfterSpotSave();
      });

      expect(result.current.showPrompt).toBe(false);
    });
  });
});
