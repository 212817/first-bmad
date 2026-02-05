// apps/web/src/services/share/types.ts

/**
 * Share service interface
 */
export interface ShareServiceInterface {
  canUseWebShare: () => boolean;
  shareSpot: (url: string, title: string) => Promise<boolean>;
  copyToClipboard: (url: string) => Promise<void>;
}

/**
 * Web Share API data structure
 */
export interface ShareData {
  title?: string;
  text?: string;
  url?: string;
}
