// apps/api/src/repositories/carTag.types.ts
import type { CarTag } from '@repo/shared/types';

/**
 * Input for creating a car tag
 */
export interface CreateCarTagInput {
  userId: string;
  name: string;
  color?: string;
}

/**
 * Input for updating a car tag
 */
export interface UpdateCarTagInput {
  name?: string;
  color?: string;
}

/**
 * Car tag repository interface
 */
export interface CarTagRepositoryInterface {
  /** Get all default (system) tags */
  getDefaults(): Promise<CarTag[]>;

  /** Get user's custom tags */
  findByUserId(userId: string): Promise<CarTag[]>;

  /** Get a tag by ID */
  findById(id: string): Promise<CarTag | null>;

  /** Create a custom tag for a user */
  create(input: CreateCarTagInput): Promise<CarTag>;

  /** Update a tag */
  update(id: string, input: UpdateCarTagInput): Promise<CarTag | null>;

  /** Delete a tag */
  delete(id: string): Promise<boolean>;
}
