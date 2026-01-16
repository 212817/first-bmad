# 4. State Management (Zustand)

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
