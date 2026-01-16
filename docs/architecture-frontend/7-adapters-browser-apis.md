# 7. Adapters (Browser APIs)

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
