// apps/web/src/services/navigation/__tests__/navigation.service.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { navigationService } from '../navigation.service';
import * as platform from '@/utils/platform';

// Mock the platform module
vi.mock('@/utils/platform', () => ({
  isIOS: vi.fn(),
}));

describe('navigationService', () => {
  const mockWindowOpen = vi.fn();
  const originalWindowOpen = window.open;

  beforeEach(() => {
    vi.clearAllMocks();
    window.open = mockWindowOpen;
  });

  afterEach(() => {
    window.open = originalWindowOpen;
  });

  describe('getPreferredProvider', () => {
    it('should return "apple" on iOS', () => {
      vi.mocked(platform.isIOS).mockReturnValue(true);
      expect(navigationService.getPreferredProvider()).toBe('apple');
    });

    it('should return "google" on non-iOS', () => {
      vi.mocked(platform.isIOS).mockReturnValue(false);
      expect(navigationService.getPreferredProvider()).toBe('google');
    });
  });

  describe('getNavigationUrl', () => {
    describe('with coordinates', () => {
      it('should return Google Maps URL on non-iOS with coordinates', () => {
        vi.mocked(platform.isIOS).mockReturnValue(false);
        const url = navigationService.getNavigationUrl({ lat: 40.7128, lng: -74.006 });
        expect(url).toBe(
          'https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=40.7128,-74.006'
        );
      });

      it('should return Apple Maps URL on iOS with coordinates', () => {
        vi.mocked(platform.isIOS).mockReturnValue(true);
        const url = navigationService.getNavigationUrl({ lat: 40.7128, lng: -74.006 });
        expect(url).toBe('https://maps.apple.com/?dirflg=w&daddr=40.7128,-74.006');
      });

      it('should prefer coordinates over address when both are provided', () => {
        vi.mocked(platform.isIOS).mockReturnValue(false);
        const url = navigationService.getNavigationUrl({
          lat: 40.7128,
          lng: -74.006,
          address: '123 Main St, New York',
        });
        expect(url).toBe(
          'https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=40.7128,-74.006'
        );
      });
    });

    describe('with address only', () => {
      it('should return Google Maps URL on non-iOS with address', () => {
        vi.mocked(platform.isIOS).mockReturnValue(false);
        const url = navigationService.getNavigationUrl({ address: '123 Main St, New York' });
        expect(url).toBe(
          'https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=123%20Main%20St%2C%20New%20York'
        );
      });

      it('should return Apple Maps URL on iOS with address', () => {
        vi.mocked(platform.isIOS).mockReturnValue(true);
        const url = navigationService.getNavigationUrl({ address: '123 Main St, New York' });
        expect(url).toBe('https://maps.apple.com/?dirflg=w&daddr=123%20Main%20St%2C%20New%20York');
      });

      it('should handle special characters in address', () => {
        vi.mocked(platform.isIOS).mockReturnValue(false);
        const url = navigationService.getNavigationUrl({ address: '123 Main St #5 & Suite' });
        expect(url).toContain('123%20Main%20St%20%235%20%26%20Suite');
      });
    });

    describe('with null coordinates', () => {
      it('should fall back to address when coordinates are null', () => {
        vi.mocked(platform.isIOS).mockReturnValue(false);
        const url = navigationService.getNavigationUrl({
          lat: null,
          lng: null,
          address: '456 Park Ave',
        });
        expect(url).toBe(
          'https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=456%20Park%20Ave'
        );
      });
    });

    describe('error cases', () => {
      it('should throw error when no coordinates or address provided', () => {
        expect(() => navigationService.getNavigationUrl({})).toThrow(
          'No valid navigation target: requires coordinates or address'
        );
      });

      it('should throw error when only null values provided', () => {
        expect(() =>
          navigationService.getNavigationUrl({ lat: null, lng: null, address: null })
        ).toThrow('No valid navigation target: requires coordinates or address');
      });
    });
  });

  describe('navigateTo', () => {
    it('should open Google Maps URL in new tab on non-iOS', () => {
      vi.mocked(platform.isIOS).mockReturnValue(false);
      navigationService.navigateTo({ lat: 40.7128, lng: -74.006 });
      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=40.7128,-74.006',
        '_blank'
      );
    });

    it('should open Apple Maps URL in new tab on iOS', () => {
      vi.mocked(platform.isIOS).mockReturnValue(true);
      navigationService.navigateTo({ lat: 40.7128, lng: -74.006 });
      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://maps.apple.com/?dirflg=w&daddr=40.7128,-74.006',
        '_blank'
      );
    });

    it('should open with address when coordinates are null', () => {
      vi.mocked(platform.isIOS).mockReturnValue(false);
      navigationService.navigateTo({ lat: null, lng: null, address: 'Times Square' });
      expect(mockWindowOpen).toHaveBeenCalledWith(
        'https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=Times%20Square',
        '_blank'
      );
    });
  });
});
