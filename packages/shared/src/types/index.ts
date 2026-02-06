// packages/shared/src/types/index.ts
// Shared TypeScript types for Where Did I Park

/**
 * OAuth provider types
 */
export type AuthProvider = 'google' | 'apple';

/**
 * User entity
 */
export interface User {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  provider: AuthProvider;
  providerId: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
}

/**
 * Parking spot entity
 * Note: latitude/longitude can be null for address-only spots (manual entry)
 */
export interface ParkingSpot {
  id: string;
  userId: string;
  carTagId: string | null;
  latitude: number | null;
  longitude: number | null;
  accuracyMeters: number | null;
  address: string | null;
  photoUrl: string | null;
  note: string | null;
  floor: string | null;
  spotIdentifier: string | null;
  meterExpiresAt: Date | null;
  isActive: boolean;
  savedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Car tag entity - user's tag library for labeling vehicles
 */
export interface CarTag {
  id: string;
  userId: string | null; // null = system default tag
  name: string;
  color: string;
  isDefault: boolean;
  createdAt: Date;
}

/**
 * Geocoding cache entity
 */
export interface GeocodingCache {
  id: string;
  lat: number;
  lng: number;
  address: string;
  createdAt: Date;
  expiresAt: Date;
}

/**
 * Standard API success response
 */
export interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}

/**
 * Standard API error response
 */
export interface ErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    fields?: Record<string, string>;
  };
}

/**
 * API Response union type
 */
export type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;
