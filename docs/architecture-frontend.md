# Where Did I Park? - Frontend Architecture

> **Version:** 1.0.0  
> **Parent:** [architecture.md](./architecture.md)  
> **Created:** 2026-01-15

---

## 1. Tech Stack

| Technology   | Version | Purpose                       |
| ------------ | ------- | ----------------------------- |
| React        | 19.x    | UI framework                  |
| Vite         | 6.x     | Build tool (Rolldown bundler) |
| TypeScript   | 5.7.x   | Type safety (strict mode)     |
| Tailwind CSS | 4.x     | Styling                       |
| Zustand      | 5.x     | State management              |
| React Router | 7.x     | Routing                       |
| Axios        | 1.7.x   | HTTP client                   |
| date-fns     | 4.x     | Date formatting               |
| Vitest       | 3.x     | Unit testing                  |
| Playwright   | 1.50.x  | E2E testing                   |
| ESLint       | 9.x     | Linting (flat config)         |

---

## 2. Project Structure

```
apps/web/
├── public/
│   ├── manifest.json           # PWA manifest
│   ├── sw.js                   # Service worker
│   └── icons/                  # App icons
├── src/
│   ├── components/             # React components
│   │   ├── auth/
│   │   │   ├── LoginButton.tsx
│   │   │   ├── AuthGuard.tsx
│   │   │   └── types.ts
│   │   ├── parking/
│   │   │   ├── ParkingCard.tsx
│   │   │   ├── ParkingMap.tsx
│   │   │   ├── SaveSpotForm.tsx
│   │   │   └── types.ts
│   │   ├── history/
│   │   │   ├── HistoryList.tsx
│   │   │   ├── HistoryItem.tsx
│   │   │   └── types.ts
│   │   ├── common/
│   │   │   ├── Button.tsx
│   │   │   ├── Input.tsx
│   │   │   ├── Modal.tsx
│   │   │   ├── ErrorFallback.tsx
│   │   │   └── types.ts
│   │   └── layout/
│   │       ├── Header.tsx
│   │       ├── BottomNav.tsx
│   │       └── types.ts
│   ├── pages/
│   │   ├── HomePage.tsx
│   │   ├── ParkPage.tsx
│   │   ├── HistoryPage.tsx
│   │   ├── SettingsPage.tsx
│   │   └── NotFoundPage.tsx
│   ├── hooks/
│   │   ├── useAuth/
│   │   │   ├── useAuth.ts
│   │   │   └── types.ts
│   │   ├── useGeolocation/
│   │   │   ├── useGeolocation.ts
│   │   │   └── types.ts
│   │   ├── useParking/
│   │   │   ├── useParking.ts
│   │   │   └── types.ts
│   │   ├── usePhoto/
│   │   │   ├── usePhoto.ts
│   │   │   └── types.ts
│   │   └── useOffline/
│   │       ├── useOffline.ts
│   │       └── types.ts
│   ├── stores/
│   │   ├── authStore.ts
│   │   ├── parkingStore.ts
│   │   ├── uiStore.ts
│   │   └── types.ts
│   ├── services/
│   │   └── api/
│   │       ├── client.ts        # Axios instance
│   │       ├── authApi.ts
│   │       ├── parkingApi.ts
│   │       ├── photoApi.ts
│   │       └── types.ts
│   ├── adapters/                # Browser API wrappers
│   │   ├── geolocation.ts
│   │   ├── camera.ts
│   │   ├── storage.ts
│   │   ├── monitoring.ts
│   │   └── types.ts
│   ├── validation/              # Form validation
│   │   ├── parkingSchema.ts
│   │   └── types.ts
│   ├── utils/
│   │   ├── tokenStorage.ts      # JWT token helpers
│   │   ├── formatters.ts
│   │   └── constants.ts
│   ├── types/                   # Shared FE types
│   │   ├── components.ts
│   │   ├── navigation.ts
│   │   └── index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── e2e/
│   ├── auth.spec.ts
│   ├── parking.spec.ts
│   └── history.spec.ts
├── index.html
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
├── playwright.config.ts
└── package.json
```

---

## 3. Component Architecture

### 3.1 Component Hierarchy

```
<App>
├── <ErrorBoundary level="app">           # App-level errors
│   ├── <AuthProvider>
│   │   ├── <Router>
│   │   │   ├── <Layout>
│   │   │   │   ├── <Header />
│   │   │   │   ├── <ErrorBoundary level="page">  # Page-level errors
│   │   │   │   │   ├── <HomePage />
│   │   │   │   │   ├── <ParkPage />
│   │   │   │   │   ├── <HistoryPage />
│   │   │   │   │   └── <SettingsPage />
│   │   │   │   └── <BottomNav />
```

### 3.2 ErrorBoundary Implementation

```typescript
// components/common/ErrorBoundary.tsx
import { Component, ReactNode } from "react";
import { captureError } from "@/adapters/monitoring";
import { ErrorFallback } from "./ErrorFallback";

interface Props {
  children: ReactNode;
  level: "app" | "page" | "component";
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    captureError(error, {
      level: this.props.level,
      componentStack: info.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;
      return (
        <ErrorFallback
          error={this.state.error}
          level={this.props.level}
          onRetry={() => this.setState({ hasError: false, error: null })}
        />
      );
    }
    return this.props.children;
  }
}
```

### 3.3 Component Template

```typescript
// components/parking/ParkingCard.tsx
import type { ParkingCardProps } from "./types";

export function ParkingCard({ spot, onNavigate, onClear }: ParkingCardProps) {
  // ❌ AVOID: No useCallback/useMemo unless proven needed
  // ✅ DO: Simple event handlers
  const handleNavigate = () => {
    onNavigate(spot.id);
  };

  const handleClear = () => {
    onClear(spot.id);
  };

  return (
    <div className="rounded-lg bg-white p-4 shadow">
      <h3 className="text-lg font-medium">
        {spot.address || "Unknown location"}
      </h3>
      {spot.photoUrl && (
        <img
          src={spot.photoUrl}
          alt="Parking spot"
          className="mt-2 h-48 w-full rounded object-cover"
        />
      )}
      <div className="mt-4 flex gap-2">
        <button onClick={handleNavigate} className="btn-primary flex-1">
          Navigate
        </button>
        <button onClick={handleClear} className="btn-secondary flex-1">
          Clear
        </button>
      </div>
    </div>
  );
}
```

---

## 4. State Management (Zustand)

### 4.1 Store Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     ZUSTAND STORES                           │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐     │
│  │  authStore  │    │parkingStore │    │   uiStore   │     │
│  ├─────────────┤    ├─────────────┤    ├─────────────┤     │
│  │ user        │    │ activeSpot  │    │ isLoading   │     │
│  │ isLoading   │    │ history     │    │ error       │     │
│  │ error       │    │ isLoading   │    │ toast       │     │
│  │ login()     │    │ saveSpot()  │    │ showToast() │     │
│  │ logout()    │    │ clearSpot() │    │ setLoading()│     │
│  └─────────────┘    │ loadHistory()│   └─────────────┘     │
│                     └─────────────┘                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

### 4.2 Auth Store

```typescript
// stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User } from '@repo/shared/types';
import type { AuthState } from './types';

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      setUser: (user: User | null) => set({ user, isAuthenticated: !!user, error: null }),

      setLoading: (isLoading: boolean) => set({ isLoading }),

      setError: (error: string | null) => set({ error, isLoading: false }),

      clearError: () => set({ error: null }),

      logout: () => set({ user: null, isAuthenticated: false, error: null }),
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ user: state.user }),
    }
  )
);
```

### 4.3 Parking Store with Optimistic Updates

```typescript
// stores/parkingStore.ts
import { create } from 'zustand';
import type { ParkingSpot } from '@repo/shared/types';
import type { ParkingState } from './types';
import { parkingApi } from '@/services/api/parkingApi';

export const useParkingStore = create<ParkingState>((set, get) => ({
  activeSpot: null,
  history: [],
  isLoading: false,
  error: null,

  // Optimistic update pattern
  saveSpot: async (data) => {
    const optimisticSpot: ParkingSpot = {
      id: `temp-${Date.now()}`,
      ...data,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Optimistic update
    set({ activeSpot: optimisticSpot, isLoading: true });

    try {
      const spot = await parkingApi.createSpot(data);
      set({ activeSpot: spot, isLoading: false });
    } catch (error) {
      // Rollback on failure
      set({ activeSpot: null, isLoading: false, error: 'Failed to save' });
      throw error;
    }
  },

  clearSpot: async (spotId: string) => {
    const previousSpot = get().activeSpot;

    // Optimistic clear
    set({ activeSpot: null, isLoading: true });

    try {
      await parkingApi.clearSpot(spotId);
      set((state) => ({
        history: [previousSpot!, ...state.history],
        isLoading: false,
      }));
    } catch (error) {
      // Rollback
      set({ activeSpot: previousSpot, isLoading: false });
      throw error;
    }
  },

  loadHistory: async (page = 1) => {
    set({ isLoading: true });
    try {
      const response = await parkingApi.getHistory(page);
      set({ history: response.data, isLoading: false });
    } catch {
      set({ isLoading: false, error: 'Failed to load history' });
    }
  },
}));
```

---

## 5. Hooks Architecture

### 5.1 Hook Organization

Each hook in its own folder with optional types:

```
hooks/
├── useAuth/
│   ├── useAuth.ts          # Main hook
│   └── types.ts            # Hook-specific types
├── useGeolocation/
│   ├── useGeolocation.ts
│   └── types.ts
```

### 5.2 useAuth Hook

```typescript
// hooks/useAuth/useAuth.ts
import { useAuthStore } from '@/stores/authStore';
import { authApi } from '@/services/api/authApi';
import type { UseAuthReturn } from './types';

export function useAuth(): UseAuthReturn {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    setUser,
    setError,
    setLoading,
    logout: clearAuth,
  } = useAuthStore();

  const login = async (provider: 'google' | 'apple') => {
    setLoading(true);
    try {
      // Redirect to OAuth - this will navigate away
      window.location.href = authApi.getOAuthUrl(provider);
    } catch (err) {
      setError('Failed to initiate login');
    }
  };

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      clearAuth();
    }
  };

  const refreshUser = async () => {
    try {
      const userData = await authApi.getMe();
      setUser(userData);
    } catch {
      clearAuth();
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    refreshUser,
  };
}
```

### 5.3 useGeolocation Hook

```typescript
// hooks/useGeolocation/useGeolocation.ts
import { useState, useEffect } from 'react';
import { geolocationAdapter } from '@/adapters/geolocation';
import type { GeolocationState } from './types';

export function useGeolocation(): GeolocationState {
  const [coords, setCoords] = useState<GeolocationCoordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const getCurrentPosition = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const position = await geolocationAdapter.getCurrentPosition();
      setCoords(position.coords);
      return position.coords;
    } catch (err) {
      const message =
        err instanceof GeolocationPositionError
          ? getErrorMessage(err.code)
          : 'Failed to get location';
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return { coords, error, isLoading, getCurrentPosition };
}

function getErrorMessage(code: number): string {
  switch (code) {
    case 1:
      return 'Location permission denied';
    case 2:
      return 'Location unavailable';
    case 3:
      return 'Location request timed out';
    default:
      return 'Unknown location error';
  }
}
```

### 5.4 useParking Hook

```typescript
// hooks/useParking/useParking.ts
import { useParkingStore } from '@/stores/parkingStore';
import { useGeolocation } from '@/hooks/useGeolocation/useGeolocation';
import { usePhoto } from '@/hooks/usePhoto/usePhoto';
import type { UseParkingReturn, SaveSpotInput } from './types';

export function useParking(): UseParkingReturn {
  const { activeSpot, history, isLoading, error, saveSpot, clearSpot, loadHistory } =
    useParkingStore();
  const { getCurrentPosition } = useGeolocation();
  const { uploadPhoto } = usePhoto();

  const park = async (input: SaveSpotInput) => {
    // Get current location
    const coords = await getCurrentPosition();

    // Upload photo if provided
    let photoUrl: string | undefined;
    if (input.photo) {
      photoUrl = await uploadPhoto(input.photo);
    }

    // Save spot
    await saveSpot({
      latitude: coords.latitude,
      longitude: coords.longitude,
      photoUrl,
      note: input.note,
      floor: input.floor,
      spotIdentifier: input.spotIdentifier,
    });
  };

  const navigate = (spotId: string) => {
    const spot = activeSpot?.id === spotId ? activeSpot : history.find((s) => s.id === spotId);
    if (!spot) return;

    // Open in native maps app
    const url = `https://www.google.com/maps/dir/?api=1&destination=${spot.latitude},${spot.longitude}`;
    window.open(url, '_blank');
  };

  return {
    activeSpot,
    history,
    isLoading,
    error,
    park,
    clearSpot,
    navigate,
    loadHistory,
  };
}
```

---

## 6. Services Layer (API)

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

## 7. Adapters (Browser APIs)

### 7.1 Geolocation Adapter

```typescript
// adapters/geolocation.ts
import type { GeolocationOptions } from './types';

const defaultOptions: GeolocationOptions = {
  enableHighAccuracy: true,
  timeout: 10000,
  maximumAge: 60000,
};

export const geolocationAdapter = {
  getCurrentPosition: (options?: Partial<GeolocationOptions>): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
        return;
      }

      navigator.geolocation.getCurrentPosition(resolve, reject, {
        ...defaultOptions,
        ...options,
      });
    });
  },

  watchPosition: (
    onSuccess: (position: GeolocationPosition) => void,
    onError: (error: GeolocationPositionError) => void,
    options?: Partial<GeolocationOptions>
  ): number => {
    return navigator.geolocation.watchPosition(onSuccess, onError, {
      ...defaultOptions,
      ...options,
    });
  },

  clearWatch: (watchId: number): void => {
    navigator.geolocation.clearWatch(watchId);
  },
};
```

### 7.2 Camera Adapter

```typescript
// adapters/camera.ts
export const cameraAdapter = {
  capturePhoto: async (): Promise<File | null> => {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'environment';

      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0] || null;
        resolve(file);
      };

      input.oncancel = () => resolve(null);
      input.click();
    });
  },

  selectFromGallery: async (): Promise<File | null> => {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';

      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0] || null;
        resolve(file);
      };

      input.oncancel = () => resolve(null);
      input.click();
    });
  },
};
```

---

## 8. Offline Support

### 8.1 Service Worker Strategy

```typescript
// public/sw.js
const CACHE_NAME = 'wdip-v1';
const STATIC_ASSETS = ['/', '/index.html', '/manifest.json'];

// Install - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS)));
});

// Fetch - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  // Skip non-GET and API requests
  if (event.request.method !== 'GET' || event.request.url.includes('/api/')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
        return response;
      })
      .catch(() => caches.match(event.request))
  );
});
```

### 8.2 Offline Data Storage

```typescript
// adapters/storage.ts
const ACTIVE_SPOT_KEY = 'wdip_active_spot';
const PENDING_ACTIONS_KEY = 'wdip_pending_actions';

export const storageAdapter = {
  // Cache active spot for offline viewing
  cacheActiveSpot: (spot: ParkingSpot | null) => {
    if (spot) {
      localStorage.setItem(ACTIVE_SPOT_KEY, JSON.stringify(spot));
    } else {
      localStorage.removeItem(ACTIVE_SPOT_KEY);
    }
  },

  getCachedActiveSpot: (): ParkingSpot | null => {
    const data = localStorage.getItem(ACTIVE_SPOT_KEY);
    return data ? JSON.parse(data) : null;
  },

  // Queue actions for sync when online
  queueAction: (action: PendingAction) => {
    const actions = storageAdapter.getPendingActions();
    actions.push(action);
    localStorage.setItem(PENDING_ACTIONS_KEY, JSON.stringify(actions));
  },

  getPendingActions: (): PendingAction[] => {
    const data = localStorage.getItem(PENDING_ACTIONS_KEY);
    return data ? JSON.parse(data) : [];
  },

  clearPendingActions: () => {
    localStorage.removeItem(PENDING_ACTIONS_KEY);
  },
};
```

---

## 9. Routing

```typescript
// App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { AuthGuard } from "@/components/auth/AuthGuard";
import { Layout } from "@/components/layout/Layout";
import { HomePage } from "@/pages/HomePage";
import { ParkPage } from "@/pages/ParkPage";
import { HistoryPage } from "@/pages/HistoryPage";
import { SettingsPage } from "@/pages/SettingsPage";
import { LoginPage } from "@/pages/LoginPage";
import { NotFoundPage } from "@/pages/NotFoundPage";

export function App() {
  return (
    <ErrorBoundary level="app">
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<AuthGuard />}>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/park" element={<ParkPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </BrowserRouter>
    </ErrorBoundary>
  );
}
```

---

## 10. Performance Targets

| Metric                         | Target  | Measurement      |
| ------------------------------ | ------- | ---------------- |
| LCP (Largest Contentful Paint) | < 2.5s  | Vercel Analytics |
| FID (First Input Delay)        | < 100ms | Vercel Analytics |
| CLS (Cumulative Layout Shift)  | < 0.1   | Vercel Analytics |
| Bundle Size (gzipped)          | < 100KB | Build output     |
| Time to Interactive            | < 3s    | Lighthouse       |

### 10.1 Performance Best Practices

1. **NO lazy loading** - Do NOT use `React.lazy()` - causes memory leaks in jsdom tests and adds complexity without meaningful benefit for small bundles
2. **Optimize images** - Compress before upload, use WebP
3. **Avoid memoization** - No `useCallback`/`useMemo` unless proven needed
4. **Tree shake** - Import only what's needed
5. **Prefetch** - Prefetch likely next routes

---

## 11. Testing Strategy

### 11.1 Coverage Targets

| Category           | Target | Tool                     |
| ------------------ | ------ | ------------------------ |
| Hooks              | 100%   | Vitest                   |
| Stores             | 95%    | Vitest                   |
| Components         | 95%    | Vitest + Testing Library |
| E2E Critical Paths | 100%   | Playwright               |

### 11.2 Unit Test Example

```typescript
// hooks/useAuth/__tests__/useAuth.test.ts
import { renderHook, act } from '@testing-library/react';
import { useAuth } from '../useAuth';

describe('useAuth', () => {
  it('should return unauthenticated state initially', () => {
    const { result } = renderHook(() => useAuth());

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it('should redirect to OAuth on login', async () => {
    const originalLocation = window.location;
    delete (window as any).location;
    window.location = { href: '' } as Location;

    const { result } = renderHook(() => useAuth());

    act(() => {
      result.current.login('google');
    });

    expect(window.location.href).toContain('/auth/google');

    window.location = originalLocation;
  });
});
```

### 11.3 E2E Test Example

```typescript
// e2e/parking.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Parking Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Mock auth
    await page.goto('/');
  });

  test('should save parking spot with photo', async ({ page }) => {
    // Mock geolocation
    await page.context().grantPermissions(['geolocation']);
    await page.context().setGeolocation({ latitude: 40.7128, longitude: -74.006 });

    await page.click('[data-testid="park-button"]');
    await page.click('[data-testid="take-photo"]');

    // Verify spot saved
    await expect(page.locator('[data-testid="active-spot"]')).toBeVisible();
  });
});
```

---

## 12. Coding Standards

### 12.1 Critical Rules

1. ❌ **No `useCallback`/`useMemo`** unless proven performance issue
2. ✅ **Types in `types.ts`** per folder, not inline
3. ✅ **Each hook in own folder** with optional types.ts
4. ✅ **Tailwind for all styling** - no CSS modules
5. ✅ **ErrorBoundaries** at app/page/component levels
6. ✅ **Adapters for browser APIs** - testable wrappers

### 12.2 Naming Conventions

| Item       | Convention             | Example            |
| ---------- | ---------------------- | ------------------ |
| Components | PascalCase             | `ParkingCard.tsx`  |
| Hooks      | camelCase with `use`   | `useParking.ts`    |
| Stores     | camelCase with `Store` | `parkingStore.ts`  |
| Types      | PascalCase             | `ParkingCardProps` |
| Constants  | UPPER_SNAKE            | `MAX_PHOTO_SIZE`   |

### 12.3 Import Order

```typescript
// 1. React
import { useState, useEffect } from 'react';

// 2. External libraries
import { format } from 'date-fns';

// 3. Internal aliases (@/)
import { useAuth } from '@/hooks/useAuth/useAuth';
import { Button } from '@/components/common/Button';

// 4. Relative imports
import type { Props } from './types';
```

---

## 13. Development Commands

```bash
# Development
pnpm dev              # Start dev server (Vite)
pnpm build            # Production build
pnpm preview          # Preview production build

# Testing
pnpm test             # Run Vitest
pnpm test:watch       # Watch mode
pnpm test:coverage    # With coverage
pnpm e2e              # Run Playwright
pnpm e2e:ui           # Playwright UI mode

# Linting
pnpm lint             # ESLint
pnpm lint:fix         # Fix issues
pnpm typecheck        # TypeScript check
```
