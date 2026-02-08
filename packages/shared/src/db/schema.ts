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

// Car tags table - user's tag library (null userId = system default tag)
export const carTags = pgTable(
  'car_tags',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id').references(() => users.id, { onDelete: 'cascade' }), // null = default tag
    name: varchar('name', { length: 50 }).notNull(),
    color: varchar('color', { length: 7 }).notNull().default('#3B82F6'), // hex color
    isDefault: boolean('is_default').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('idx_car_tags_user').on(table.userId)]
);

// Parking spots table
export const parkingSpots = pgTable(
  'parking_spots',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    carTagId: uuid('car_tag_id').references(() => carTags.id, { onDelete: 'set null' }), // optional car tag
    latitude: doublePrecision('latitude'),
    longitude: doublePrecision('longitude'),
    accuracyMeters: integer('accuracy_meters'),
    address: text('address'),
    photoUrl: text('photo_url'),
    note: text('note'),
    floor: varchar('floor', { length: 50 }),
    spotIdentifier: varchar('spot_identifier', { length: 100 }),
    meterExpiresAt: timestamp('meter_expires_at', { withTimezone: true }),
    isActive: boolean('is_active').notNull().default(true),
    savedAt: timestamp('saved_at', { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('idx_spots_user_saved').on(table.userId, table.savedAt)]
);

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
  (table) => [
    index('idx_geocache_address_query').on(table.addressQuery),
    index('idx_geocache_coords').on(table.lat, table.lng),
  ]
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

// Share tokens table for shareable spot links
export const shareTokens = pgTable(
  'share_tokens',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    token: varchar('token', { length: 32 }).notNull().unique(),
    spotId: uuid('spot_id')
      .notNull()
      .references(() => parkingSpots.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  },
  (table) => [index('idx_share_tokens_token').on(table.token)]
);
