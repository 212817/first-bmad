import axios from 'axios';
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Axios API client instance
 * Uses cookies for auth (httpOnly cookies set by backend)
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Required for sending cookies
});

/**
 * Request interceptor for adding auth token from localStorage (fallback)
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Cookies are sent automatically with withCredentials: true
    // This is just for backward compatibility if using localStorage tokens
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// Flag to prevent infinite refresh loops
let isRefreshing = false;

/**
 * Response interceptor for handling errors and auto-refresh
 */
apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Handle 401 unauthorized - try to refresh token once
    if (error.response?.status === 401 && originalRequest && !isRefreshing) {
      isRefreshing = true;

      try {
        // Try to refresh the access token
        // Send refresh token in body for Safari/iOS where cookies don't work
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await apiClient.post<{ success: true; data: { accessToken?: string } }>(
          '/v1/auth/refresh',
          refreshToken ? { refreshToken } : {}
        );

        // Store new access token if returned
        if (response.data?.data?.accessToken) {
          localStorage.setItem('accessToken', response.data.data.accessToken);
        }

        isRefreshing = false;

        // Retry the original request
        return apiClient(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        // Redirect to login if refresh also fails
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

/**
 * Health check API call
 */
export async function checkHealth(): Promise<{
  api: string;
  database: string;
  timestamp: string;
}> {
  const response = await apiClient.get('/health');
  return response.data;
}

export default apiClient;
