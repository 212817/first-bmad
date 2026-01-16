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
 */
export interface ParkingSpot {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  address: string | null;
  photoUrl: string | null;
  note: string | null;
  floor: string | null;
  spotIdentifier: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Car tag entity
 */
export interface CarTag {
  id: string;
  spotId: string;
  label: string;
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
