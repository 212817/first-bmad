# 6. Services Layer (API)

### 6.1 API Client

```typescript
// services/api/client.ts
import axios from 'axios';
import { getAccessToken, setTokens, clearTokens } from '@/utils/tokenStorage';

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true,
});

// Request interceptor - add auth token
apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - handle 401 & refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const response = await axios.post(
          `${import.meta.env.VITE_API_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );
        setTokens(response.data.accessToken);
        return apiClient(originalRequest);
      } catch {
        clearTokens();
        window.location.href = '/login';
      }
    }

    return Promise.reject(error);
  }
);
```

### 6.2 Parking API Service

```typescript
// services/api/parkingApi.ts
import { apiClient } from './client';
import type { ParkingSpot, CreateSpotRequest, PaginatedResponse } from '@repo/shared/types';

export const parkingApi = {
  createSpot: async (data: CreateSpotRequest): Promise<ParkingSpot> => {
    const response = await apiClient.post<{ data: ParkingSpot }>('/spots', data);
    return response.data.data;
  },

  getActiveSpot: async (): Promise<ParkingSpot | null> => {
    const response = await apiClient.get<{ data: ParkingSpot | null }>('/spots/active');
    return response.data.data;
  },

  clearSpot: async (spotId: string): Promise<void> => {
    await apiClient.post(`/spots/${spotId}/clear`);
  },

  getHistory: async (page = 1, limit = 20): Promise<PaginatedResponse<ParkingSpot>> => {
    const response = await apiClient.get('/spots', { params: { page, limit } });
    return response.data;
  },

  deleteSpot: async (spotId: string): Promise<void> => {
    await apiClient.delete(`/spots/${spotId}`);
  },
};
```

---
