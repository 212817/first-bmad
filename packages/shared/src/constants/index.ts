// packages/shared/src/constants/index.ts
// Shared constants for Where Did I Park

/**
 * App information
 */
export const APP_NAME = 'Where Did I Park';
export const APP_VERSION = '0.0.1';

/**
 * API configuration
 */
export const API_VERSION = 'v1';
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

/**
 * Limits
 */
export const MAX_NOTE_LENGTH = 500;
export const MAX_PHOTO_SIZE_MB = 5;
export const MAX_PHOTO_SIZE_BYTES = MAX_PHOTO_SIZE_MB * 1024 * 1024;
export const MAX_ADDRESS_LENGTH = 255;
export const MAX_FLOOR_LENGTH = 50;
export const MAX_SPOT_IDENTIFIER_LENGTH = 100;
export const MAX_CAR_TAG_LABEL_LENGTH = 50;
export const MAX_CAR_TAGS_PER_SPOT = 5;

/**
 * Coordinate bounds
 */
export const LAT_MIN = -90;
export const LAT_MAX = 90;
export const LNG_MIN = -180;
export const LNG_MAX = 180;

/**
 * Cache durations (in seconds)
 */
export const GEOCODING_CACHE_TTL = 60 * 60 * 24 * 30; // 30 days

/**
 * Error codes
 */
export const ErrorCodes = {
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
  AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  RATE_LIMIT_EXCEEDED: 'RATE_LIMIT_EXCEEDED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = (typeof ErrorCodes)[keyof typeof ErrorCodes];
