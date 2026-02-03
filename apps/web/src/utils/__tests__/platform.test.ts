// apps/web/src/utils/__tests__/platform.test.ts
import { describe, it, expect, afterEach } from 'vitest';
import { isIOS, isAndroid, isMobile } from '../platform';

describe('platform utilities', () => {
  const originalNavigator = globalThis.navigator;

  afterEach(() => {
    Object.defineProperty(globalThis, 'navigator', {
      value: originalNavigator,
      writable: true,
      configurable: true,
    });
  });

  describe('isIOS', () => {
    it('should return true for iPhone user agent', () => {
      // @ts-expect-error - Mocking navigator
      globalThis.navigator = {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        platform: 'iPhone',
        maxTouchPoints: 5,
      };
      expect(isIOS()).toBe(true);
    });

    it('should return true for iPad user agent', () => {
      // @ts-expect-error - Mocking navigator
      globalThis.navigator = {
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X)',
        platform: 'iPad',
        maxTouchPoints: 5,
      };
      expect(isIOS()).toBe(true);
    });

    it('should return true for iPadOS (Mac with touch)', () => {
      // @ts-expect-error - Mocking navigator
      globalThis.navigator = {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        platform: 'MacIntel',
        maxTouchPoints: 5,
      };
      expect(isIOS()).toBe(true);
    });

    it('should return false for Mac without touch (desktop)', () => {
      // @ts-expect-error - Mocking navigator
      globalThis.navigator = {
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        platform: 'MacIntel',
        maxTouchPoints: 0,
      };
      expect(isIOS()).toBe(false);
    });

    it('should return false for Android', () => {
      // @ts-expect-error - Mocking navigator
      globalThis.navigator = {
        userAgent: 'Mozilla/5.0 (Linux; Android 14)',
        platform: 'Linux',
        maxTouchPoints: 5,
      };
      expect(isIOS()).toBe(false);
    });

    it('should return false for Windows', () => {
      // @ts-expect-error - Mocking navigator
      globalThis.navigator = {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        platform: 'Win32',
        maxTouchPoints: 0,
      };
      expect(isIOS()).toBe(false);
    });

    it('should return false when navigator is undefined (SSR)', () => {
      // @ts-expect-error - Mocking navigator as undefined
      globalThis.navigator = undefined;
      expect(isIOS()).toBe(false);
    });
  });

  describe('isAndroid', () => {
    it('should return true for Android user agent', () => {
      // @ts-expect-error - Mocking navigator
      globalThis.navigator = {
        userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8)',
        platform: 'Linux',
      };
      expect(isAndroid()).toBe(true);
    });

    it('should return false for iOS', () => {
      // @ts-expect-error - Mocking navigator
      globalThis.navigator = {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        platform: 'iPhone',
      };
      expect(isAndroid()).toBe(false);
    });

    it('should return false for Windows', () => {
      // @ts-expect-error - Mocking navigator
      globalThis.navigator = {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        platform: 'Win32',
      };
      expect(isAndroid()).toBe(false);
    });

    it('should return false when navigator is undefined (SSR)', () => {
      // @ts-expect-error - Mocking navigator as undefined
      globalThis.navigator = undefined;
      expect(isAndroid()).toBe(false);
    });
  });

  describe('isMobile', () => {
    it('should return true for iOS', () => {
      // @ts-expect-error - Mocking navigator
      globalThis.navigator = {
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
        platform: 'iPhone',
        maxTouchPoints: 5,
      };
      expect(isMobile()).toBe(true);
    });

    it('should return true for Android', () => {
      // @ts-expect-error - Mocking navigator
      globalThis.navigator = {
        userAgent: 'Mozilla/5.0 (Linux; Android 14)',
        platform: 'Linux',
        maxTouchPoints: 5,
      };
      expect(isMobile()).toBe(true);
    });

    it('should return false for desktop', () => {
      // @ts-expect-error - Mocking navigator
      globalThis.navigator = {
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        platform: 'Win32',
        maxTouchPoints: 0,
      };
      expect(isMobile()).toBe(false);
    });
  });
});
