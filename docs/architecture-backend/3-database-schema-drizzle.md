# 3. Database Schema (Drizzle)

### 3.1 Schema Definition

```typescript
// packages/shared/src/db/schema.ts
import {
  pgTable,
  uuid,
  varchar,
  text,
  decimal,
  boolean,
  timestamp,
  index,
} from 'drizzle-orm/pg-core';

export const users = pgTable(
  'users',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    displayName: varchar('display_name', { length: 255 }),
    avatarUrl: text('avatar_url'),
    provider: varchar('provider', { length: 20 }).notNull(), // 'google' | 'apple'
    providerId: varchar('provider_id', { length: 255 }).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    lastLoginAt: timestamp('last_login_at').defaultNow().notNull(),
  },
  (table) => ({
    providerIdx: index('users_provider_idx').on(table.provider, table.providerId),
  })
);

export const parkingSpots = pgTable(
  'parking_spots',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    latitude: decimal('latitude', { precision: 10, scale: 7 }).notNull(),
    longitude: decimal('longitude', { precision: 10, scale: 7 }).notNull(),
    address: text('address'),
    photoUrl: text('photo_url'),
    note: text('note'),
    floor: varchar('floor', { length: 50 }),
    spotIdentifier: varchar('spot_identifier', { length: 100 }),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => ({
    userActiveIdx: index('spots_user_active_idx').on(table.userId, table.isActive),
    userCreatedIdx: index('spots_user_created_idx').on(table.userId, table.createdAt),
  })
);

export const carTags = pgTable('car_tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  spotId: uuid('spot_id')
    .notNull()
    .references(() => parkingSpots.id, { onDelete: 'cascade' }),
  label: varchar('label', { length: 100 }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const geocodingCache = pgTable(
  'geocoding_cache',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    lat: decimal('lat', { precision: 10, scale: 7 }).notNull(),
    lng: decimal('lng', { precision: 10, scale: 7 }).notNull(),
    address: text('address').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    expiresAt: timestamp('expires_at').notNull(),
  },
  (table) => ({
    coordsIdx: index('geocache_coords_idx').on(table.lat, table.lng),
  })
);

export const refreshTokens = pgTable(
  'refresh_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: varchar('token_hash', { length: 64 }).notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    userIdx: index('refresh_tokens_user_idx').on(table.userId),
    tokenIdx: index('refresh_tokens_token_idx').on(table.tokenHash),
  })
);
```

### 3.2 Type Inference

```typescript
// packages/shared/src/db/types.ts
import type { InferSelectModel, InferInsertModel } from 'drizzle-orm';
import { users, parkingSpots, carTags, geocodingCache, refreshTokens } from './schema';

export type User = InferSelectModel<typeof users>;
export type NewUser = InferInsertModel<typeof users>;

export type ParkingSpot = InferSelectModel<typeof parkingSpots>;
export type NewParkingSpot = InferInsertModel<typeof parkingSpots>;

export type CarTag = InferSelectModel<typeof carTags>;
export type NewCarTag = InferInsertModel<typeof carTags>;

export type GeocodingCache = InferSelectModel<typeof geocodingCache>;
export type RefreshToken = InferSelectModel<typeof refreshTokens>;
```

---
