// apps/web/src/services/navigation/__tests__/navigation.service.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { navigationService } from '../navigation.service';

describe('navigationService', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.location.href
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
  });

  describe('getNavigationUrl', () => {
    describe('with coordinates and explicit provider', () => {
      it('should return Google Maps URL with walking directions', () => {
        const url = navigationService.getNavigationUrl({ lat: 40.7128, lng: -74.006 }, 'google');
        expect(url).toBe(
          'https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=40.7128,-74.006'
        );
      });

      it('should return Apple Maps URL with walking directions', () => {
        const url = navigationService.getNavigationUrl({ lat: 40.7128, lng: -74.006 }, 'apple');
        expect(url).toBe('https://maps.apple.com/?dirflg=w&daddr=40.7128,-74.006');
      });

      it('should default to Google Maps when no provider specified', () => {
        const url = navigationService.getNavigationUrl({ lat: 40.7128, lng: -74.006 });
        expect(url).toBe(
          'https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=40.7128,-74.006'
        );
      });

      it('should prefer coordinates over address when both are provided', () => {
        const url = navigationService.getNavigationUrl(
          {
            lat: 40.7128,
            lng: -74.006,
            address: '123 Main St, New York',
          },
          'google'
        );
        expect(url).toBe(
          'https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=40.7128,-74.006'
        );
      });
    });

    describe('with address only', () => {
      it('should return Google Maps URL with address', () => {
        const url = navigationService.getNavigationUrl(
          { address: '123 Main St, New York' },
          'google'
        );
        expect(url).toBe(
          'https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=123%20Main%20St%2C%20New%20York'
        );
      });

      it('should return Apple Maps URL with address', () => {
        const url = navigationService.getNavigationUrl(
          { address: '123 Main St, New York' },
          'apple'
        );
        expect(url).toBe('https://maps.apple.com/?dirflg=w&daddr=123%20Main%20St%2C%20New%20York');
      });

      it('should handle special characters in address', () => {
        const url = navigationService.getNavigationUrl(
          { address: '123 Main St #5 & Suite' },
          'google'
        );
        expect(url).toContain('123%20Main%20St%20%235%20%26%20Suite');
      });
    });

    describe('with null coordinates', () => {
      it('should fall back to address when coordinates are null', () => {
        const url = navigationService.getNavigationUrl(
          {
            lat: null,
            lng: null,
            address: '456 Park Ave',
          },
          'google'
        );
        expect(url).toBe(
          'https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=456%20Park%20Ave'
        );
      });
    });

    describe('error cases', () => {
      it('should throw error when no coordinates or address provided', () => {
        expect(() => navigationService.getNavigationUrl({}, 'google')).toThrow(
          'No valid navigation target: requires coordinates or address'
        );
      });

      it('should throw error when only null values provided', () => {
        expect(() =>
          navigationService.getNavigationUrl({ lat: null, lng: null, address: null }, 'google')
        ).toThrow('No valid navigation target: requires coordinates or address');
      });
    });
  });

  describe('navigateTo', () => {
    it('should navigate to Google Maps URL with explicit provider', () => {
      navigationService.navigateTo({ lat: 40.7128, lng: -74.006 }, 'google');
      expect(window.location.href).toBe(
        'https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=40.7128,-74.006'
      );
    });

    it('should navigate to Apple Maps URL with explicit provider', () => {
      navigationService.navigateTo({ lat: 40.7128, lng: -74.006 }, 'apple');
      expect(window.location.href).toBe('https://maps.apple.com/?dirflg=w&daddr=40.7128,-74.006');
    });

    it('should default to Google Maps when no provider specified', () => {
      navigationService.navigateTo({ lat: 40.7128, lng: -74.006 });
      expect(window.location.href).toBe(
        'https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=40.7128,-74.006'
      );
    });

    it('should navigate with address when coordinates are null', () => {
      navigationService.navigateTo({ lat: null, lng: null, address: 'Times Square' }, 'google');
      expect(window.location.href).toBe(
        'https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=Times%20Square'
      );
    });
  });
});
