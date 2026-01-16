# 2. Project Structure

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
