// apps/web/src/services/navigation/navigation.service.ts
import { isIOS } from '@/utils/platform';
import type { NavigationTarget, MapProvider, NavigationService } from './types';

/**
 * Google Maps walking directions URL template
 */
const GOOGLE_MAPS_BASE = 'https://www.google.com/maps/dir/?api=1&travelmode=walking&destination=';

/**
 * Apple Maps walking directions URL template
 */
const APPLE_MAPS_BASE = 'https://maps.apple.com/?dirflg=w&daddr=';

/**
 * Build Google Maps navigation URL
 */
const buildGoogleMapsUrl = (destination: string): string => {
  return `${GOOGLE_MAPS_BASE}${destination}`;
};

/**
 * Build Apple Maps navigation URL
 */
const buildAppleMapsUrl = (destination: string): string => {
  return `${APPLE_MAPS_BASE}${destination}`;
};

/**
 * Get destination string from navigation target
 * Prefers coordinates over address if both are available
 */
const getDestinationString = (target: NavigationTarget): string => {
  // Prefer coordinates if available
  if (
    target.lat !== undefined &&
    target.lat !== null &&
    target.lng !== undefined &&
    target.lng !== null
  ) {
    return `${target.lat},${target.lng}`;
  }

  // Fall back to address
  if (target.address) {
    return encodeURIComponent(target.address);
  }

  throw new Error('No valid navigation target: requires coordinates or address');
};

/**
 * Navigation service for opening map apps with walking directions
 * On iOS, opens Apple Maps; on other platforms, opens Google Maps
 */
export const navigationService: NavigationService = {
  /**
   * Get the preferred map provider for the current platform
   * iOS devices use Apple Maps, all others use Google Maps
   */
  getPreferredProvider: (): MapProvider => {
    return isIOS() ? 'apple' : 'google';
  },

  /**
   * Generate the navigation URL for a target
   * @param target - The navigation target (coordinates and/or address)
   * @returns The deep link URL for the appropriate maps app
   * @throws Error if target has no coordinates or address
   */
  getNavigationUrl: (target: NavigationTarget): string => {
    const destination = getDestinationString(target);
    const provider = navigationService.getPreferredProvider();

    if (provider === 'apple') {
      return buildAppleMapsUrl(destination);
    }

    return buildGoogleMapsUrl(destination);
  },

  /**
   * Open the maps app with walking directions to the target
   * Uses location.href to avoid blank tab on mobile when maps app handles the URL
   * @param target - The navigation target (coordinates and/or address)
   */
  navigateTo: (target: NavigationTarget): void => {
    const url = navigationService.getNavigationUrl(target);
    // Use location.href to avoid opening a blank tab when maps app intercepts
    window.location.href = url;
  },
};
