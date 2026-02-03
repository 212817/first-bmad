// packages/shared/src/db/schema.ts
import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  boolean,
  doublePrecision,
  integer,
  index,
} from 'drizzle-orm/pg-core';

// Users table
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  displayName: varchar('display_name', { length: 255 }),
  avatarUrl: text('avatar_url'),
  provider: varchar('provider', { length: 20 }).notNull(), // 'google' | 'apple'
  providerId: varchar('provider_id', { length: 255 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }).notNull().defaultNow(),
});

// Parking spots table
export const parkingSpots = pgTable(
  'parking_spots',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    latitude: doublePrecision('latitude'),
    longitude: doublePrecision('longitude'),
    accuracyMeters: integer('accuracy_meters'),
    address: text('address'),
    photoUrl: text('photo_url'),
    note: text('note'),
    floor: varchar('floor', { length: 50 }),
    spotIdentifier: varchar('spot_identifier', { length: 100 }),
    isActive: boolean('is_active').notNull().default(true),
    savedAt: timestamp('saved_at', { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('idx_spots_user_saved').on(table.userId, table.savedAt)]
);

// Car tags table
export const carTags = pgTable('car_tags', {
  id: uuid('id').primaryKey().defaultRandom(),
  spotId: uuid('spot_id')
    .notNull()
    .references(() => parkingSpots.id, { onDelete: 'cascade' }),
  label: varchar('label', { length: 50 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// Geocoding cache table - caches address lookups to conserve API quota
export const geocodingCache = pgTable(
  'geocoding_cache',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    addressQuery: text('address_query').notNull().unique(),
    lat: doublePrecision('lat').notNull(),
    lng: doublePrecision('lng').notNull(),
    formattedAddress: text('formatted_address'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('idx_geocache_address_query').on(table.addressQuery)]
);

// Refresh tokens table for session management
export const refreshTokens = pgTable('refresh_tokens', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  tokenHash: varchar('token_hash', { length: 64 }).notNull(),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
