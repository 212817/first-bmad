# 4. Data Models

### 4.1 Entity Relationship Diagram

```
┌─────────────┐       ┌─────────────────┐       ┌─────────────┐
│    User     │       │   ParkingSpot   │       │   CarTag    │
├─────────────┤       ├─────────────────┤       ├─────────────┤
│ id (PK)     │──────<│ userId (FK)     │       │ id (PK)     │
│ email       │       │ id (PK)         │>──────│ spotId (FK) │
│ displayName │       │ latitude        │       │ label       │
│ avatarUrl   │       │ longitude       │       │ createdAt   │
│ provider    │       │ address         │       └─────────────┘
│ providerId  │       │ photoUrl        │
│ createdAt   │       │ note            │
│ updatedAt   │       │ floor           │
│ lastLoginAt │       │ spotIdentifier  │
└─────────────┘       │ isActive        │
                      │ createdAt       │
                      │ updatedAt       │
                      └─────────────────┘
                             │
                             │
                      ┌──────▼──────┐
                      │GeocodingCache│
                      ├─────────────┤
                      │ id (PK)     │
                      │ lat         │
                      │ lng         │
                      │ address     │
                      │ createdAt   │
                      │ expiresAt   │
                      └─────────────┘
```

### 4.2 TypeScript Interfaces (Shared)

```typescript
// packages/shared/src/types/models.ts

export interface User {
  id: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  provider: 'google' | 'apple';
  providerId: string;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date;
}

export interface ParkingSpot {
  id: string;
  userId: string;
  latitude: number;
  longitude: number;
  address: string | null;
  photoUrl: string | null;
  note: string | null;
  floor: string | null;
  spotIdentifier: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CarTag {
  id: string;
  spotId: string;
  label: string;
  createdAt: Date;
}

export interface GeocodingCache {
  id: string;
  lat: number;
  lng: number;
  address: string;
  createdAt: Date;
  expiresAt: Date;
}
```

---
