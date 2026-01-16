// apps/web/src/services/api/authApi.ts
import { apiClient } from './client';
import type { CurrentUser } from '@/stores/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Auth API service
 */
export const authApi = {
  /**
   * Get OAuth URL for a provider
   */
  getOAuthUrl(provider: 'google' | 'apple'): string {
    return `${API_URL}/v1/auth/${provider}`;
  },

  /**
   * Get current authenticated user
   */
  async getMe(): Promise<CurrentUser> {
    const response = await apiClient.get<{ success: true; data: CurrentUser }>('/v1/auth/me');
    return response.data.data;
  },

  /**
   * Refresh access token
   */
  async refresh(): Promise<CurrentUser> {
    const response = await apiClient.post<{ success: true; data: CurrentUser }>('/v1/auth/refresh');
    return response.data.data;
  },

  /**
   * Logout - invalidate session
   */
  async logout(): Promise<void> {
    await apiClient.post('/v1/auth/logout');
  },
};
