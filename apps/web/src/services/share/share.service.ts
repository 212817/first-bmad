// apps/web/src/services/share/share.service.ts
import type { ShareServiceInterface } from './types.js';

/**
 * Share service - handles Web Share API and clipboard fallback
 */
export const shareService: ShareServiceInterface = {
  /**
   * Check if Web Share API is available
   */
  canUseWebShare: (): boolean => {
    return 'share' in navigator && 'canShare' in navigator;
  },

  /**
   * Share a spot using Web Share API
   * Returns true if shared successfully, false if cancelled or not available
   */
  shareSpot: async (url: string, title: string): Promise<boolean> => {
    if (!shareService.canUseWebShare()) {
      return false;
    }

    try {
      await navigator.share({
        title,
        text: "Here's where I parked",
        url,
      });
      return true;
    } catch (error) {
      if ((error as Error).name === 'AbortError') {
        // User cancelled - not an error
        return false;
      }
      throw error;
    }
  },

  /**
   * Copy URL to clipboard as fallback
   */
  copyToClipboard: async (url: string): Promise<void> => {
    await navigator.clipboard.writeText(url);
  },
};
