// apps/api/src/repositories/carTag.repository.ts
import { eq, isNull } from 'drizzle-orm';
import { db } from '../config/db.js';
import { carTags } from '@repo/shared/db';
import type { CarTag } from '@repo/shared/types';
import type {
  CreateCarTagInput,
  UpdateCarTagInput,
  CarTagRepositoryInterface,
} from './carTag.types.js';

/**
 * Safely converts a value to a Date object
 */
const toDate = (value: Date | string | null | undefined): Date => {
  if (value instanceof Date) return value;
  if (typeof value === 'string' && value) return new Date(value);
  return new Date();
};

/**
 * Maps database row to CarTag entity
 */
const mapToCarTag = (row: typeof carTags.$inferSelect): CarTag => ({
  id: row.id,
  userId: row.userId,
  name: row.name,
  color: row.color,
  isDefault: row.isDefault,
  createdAt: toDate(row.createdAt),
});

/**
 * Car tag repository - data access layer for car_tags table
 */
export const carTagRepository: CarTagRepositoryInterface = {
  /**
   * Get all default (system) tags - tags with null userId
   */
  async getDefaults(): Promise<CarTag[]> {
    const rows = await db.select().from(carTags).where(isNull(carTags.userId));
    return rows.map(mapToCarTag);
  },

  /**
   * Get a default (system) tag by name
   */
  async findDefaultByName(name: string): Promise<CarTag | null> {
    const rows = await db.select().from(carTags).where(eq(carTags.name, name)).limit(1);
    // Find the default one (isDefault = true)
    const defaultTag = rows.find((r) => r.isDefault);
    return defaultTag ? mapToCarTag(defaultTag) : rows[0] ? mapToCarTag(rows[0]) : null;
  },

  /**
   * Get user's custom tags
   */
  async findByUserId(userId: string): Promise<CarTag[]> {
    const rows = await db.select().from(carTags).where(eq(carTags.userId, userId));
    return rows.map(mapToCarTag);
  },

  /**
   * Find a tag by ID
   */
  async findById(id: string): Promise<CarTag | null> {
    const rows = await db.select().from(carTags).where(eq(carTags.id, id)).limit(1);
    return rows[0] ? mapToCarTag(rows[0]) : null;
  },

  /**
   * Create a custom tag for a user
   */
  async create(input: CreateCarTagInput): Promise<CarTag> {
    const rows = await db
      .insert(carTags)
      .values({
        userId: input.userId,
        name: input.name,
        color: input.color ?? '#3B82F6',
        isDefault: false,
      })
      .returning();

    return mapToCarTag(rows[0]!);
  },

  /**
   * Create a default (system-level) tag with no userId
   */
  async createDefault(name: string, color: string): Promise<CarTag> {
    const rows = await db
      .insert(carTags)
      .values({
        userId: null,
        name,
        color,
        isDefault: true,
      })
      .returning();

    return mapToCarTag(rows[0]!);
  },

  /**
   * Update a tag
   */
  async update(id: string, input: UpdateCarTagInput): Promise<CarTag | null> {
    const rows = await db
      .update(carTags)
      .set({
        ...(input.name !== undefined && { name: input.name }),
        ...(input.color !== undefined && { color: input.color }),
      })
      .where(eq(carTags.id, id))
      .returning();

    return rows[0] ? mapToCarTag(rows[0]) : null;
  },

  /**
   * Delete a tag
   */
  async delete(id: string): Promise<boolean> {
    const result = await db.delete(carTags).where(eq(carTags.id, id)).returning();
    return result.length > 0;
  },
};
