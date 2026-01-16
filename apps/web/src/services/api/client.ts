import axios from 'axios';
import type { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

/**
 * Axios API client instance
 */
export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request interceptor for adding auth token
 */
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('accessToken');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

/**
 * Response interceptor for handling errors
 */
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Handle 401 unauthorized
    if (error.response?.status === 401) {
      localStorage.removeItem('accessToken');
      // TODO: Redirect to login or dispatch logout action
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
