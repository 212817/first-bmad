// apps/web/src/services/share/__tests__/share.service.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { shareService } from '../share.service';

describe('shareService', () => {
  const originalNavigator = globalThis.navigator;

  beforeEach(() => {
    vi.restoreAllMocks();
  });

  afterEach(() => {
    Object.defineProperty(globalThis, 'navigator', {
      value: originalNavigator,
      configurable: true,
    });
  });

  describe('canUseWebShare', () => {
    it('should return true when Web Share API is available', () => {
      Object.defineProperty(globalThis, 'navigator', {
        value: {
          share: vi.fn(),
          canShare: vi.fn(),
        },
        configurable: true,
      });

      expect(shareService.canUseWebShare()).toBe(true);
    });

    it('should return false when share is not available', () => {
      Object.defineProperty(globalThis, 'navigator', {
        value: {
          canShare: vi.fn(),
        },
        configurable: true,
      });

      expect(shareService.canUseWebShare()).toBe(false);
    });

    it('should return false when canShare is not available', () => {
      Object.defineProperty(globalThis, 'navigator', {
        value: {
          share: vi.fn(),
        },
        configurable: true,
      });

      expect(shareService.canUseWebShare()).toBe(false);
    });
  });

  describe('shareSpot', () => {
    it('should return false when Web Share API is not available', async () => {
      Object.defineProperty(globalThis, 'navigator', {
        value: {},
        configurable: true,
      });

      const result = await shareService.shareSpot('https://example.com/s/abc', 'My Spot');

      expect(result).toBe(false);
    });

    it('should call navigator.share and return true on success', async () => {
      const mockShare = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(globalThis, 'navigator', {
        value: {
          share: mockShare,
          canShare: vi.fn(),
        },
        configurable: true,
      });

      const result = await shareService.shareSpot('https://example.com/s/abc', 'My Spot');

      expect(mockShare).toHaveBeenCalledWith({
        title: 'My Spot',
        text: "Here's where I parked",
        url: 'https://example.com/s/abc',
      });
      expect(result).toBe(true);
    });

    it('should return false when user cancels (AbortError)', async () => {
      const abortError = new Error('User cancelled');
      abortError.name = 'AbortError';
      const mockShare = vi.fn().mockRejectedValue(abortError);

      Object.defineProperty(globalThis, 'navigator', {
        value: {
          share: mockShare,
          canShare: vi.fn(),
        },
        configurable: true,
      });

      const result = await shareService.shareSpot('https://example.com/s/abc', 'My Spot');

      expect(result).toBe(false);
    });

    it('should throw error for non-AbortError failures', async () => {
      const networkError = new Error('Network failed');
      const mockShare = vi.fn().mockRejectedValue(networkError);

      Object.defineProperty(globalThis, 'navigator', {
        value: {
          share: mockShare,
          canShare: vi.fn(),
        },
        configurable: true,
      });

      await expect(shareService.shareSpot('https://example.com/s/abc', 'My Spot')).rejects.toThrow(
        'Network failed'
      );
    });
  });

  describe('copyToClipboard', () => {
    it('should write URL to clipboard', async () => {
      const mockWriteText = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(globalThis, 'navigator', {
        value: {
          clipboard: {
            writeText: mockWriteText,
          },
        },
        configurable: true,
      });

      await shareService.copyToClipboard('https://example.com/s/abc');

      expect(mockWriteText).toHaveBeenCalledWith('https://example.com/s/abc');
    });

    it('should propagate clipboard errors', async () => {
      const mockWriteText = vi.fn().mockRejectedValue(new Error('Clipboard access denied'));
      Object.defineProperty(globalThis, 'navigator', {
        value: {
          clipboard: {
            writeText: mockWriteText,
          },
        },
        configurable: true,
      });

      await expect(shareService.copyToClipboard('https://example.com/s/abc')).rejects.toThrow(
        'Clipboard access denied'
      );
    });
  });
});
