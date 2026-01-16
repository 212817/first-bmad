# 5. Hooks Architecture

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
