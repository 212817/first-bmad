# 8. Offline Support

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
