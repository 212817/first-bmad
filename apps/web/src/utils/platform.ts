// apps/web/src/utils/platform.ts

/**
 * Detect if the current device is running iOS (iPhone, iPad, iPod)
 * Handles both traditional iOS detection and iPadOS (reports as Mac but has touch)
 */
export const isIOS = (): boolean => {
  // SSR guard
  if (typeof navigator === 'undefined') {
    return false;
  }

  const userAgent = navigator.userAgent || '';

  // Check for iOS devices
  if (/iPad|iPhone|iPod/.test(userAgent)) {
    return true;
  }

  // Check for iPadOS (reports as Mac but has touch)
  if (
    navigator.platform === 'MacIntel' &&
    typeof navigator.maxTouchPoints === 'number' &&
    navigator.maxTouchPoints > 1
  ) {
    return true;
  }

  return false;
};

/**
 * Detect if the current device is running Android
 */
export const isAndroid = (): boolean => {
  // SSR guard
  if (typeof navigator === 'undefined') {
    return false;
  }

  return /Android/i.test(navigator.userAgent);
};

/**
 * Detect if the current device is a mobile device (iOS or Android)
 */
export const isMobile = (): boolean => {
  return isIOS() || isAndroid();
};
