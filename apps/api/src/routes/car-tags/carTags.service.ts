// apps/api/src/routes/car-tags/carTags.service.ts
import { carTagRepository } from '../../repositories/carTag.repository.js';
import { NotFoundError, AuthorizationError, ValidationError } from '@repo/shared/errors';
import type { CarTag } from '@repo/shared/types';
import type { CreateCarTagRequest, UpdateCarTagRequest, CarTagResponse } from './types.js';

/**
 * Default system tags that should exist for all users
 */
const SYSTEM_DEFAULT_TAGS = [
  { name: 'My Car', color: '#3B82F6' },
  { name: 'Rental', color: '#10B981' },
  { name: 'Other', color: '#6B7280' },
];

/**
 * Maps CarTag entity to API response
 */
const toResponse = (tag: CarTag): CarTagResponse => ({
  id: tag.id,
  name: tag.name,
  color: tag.color,
  isDefault: tag.isDefault,
});

/**
 * Ensures default system tags exist in the database
 * Called on first request to get tags
 */
let defaultsSeeded = false;
const ensureDefaultTagsExist = async (): Promise<void> => {
  if (defaultsSeeded) return;

  const existing = await carTagRepository.getDefaults();
  if (existing.length === 0) {
    // Seed default tags (system-level, no userId)
    for (const tag of SYSTEM_DEFAULT_TAGS) {
      await carTagRepository.createDefault(tag.name, tag.color);
    }
  }
  defaultsSeeded = true;
};

/**
 * Car tags service - business logic for car tag operations
 */
export const carTagsService = {
  /**
   * Get all tags for a user (defaults + custom)
   */
  async getAllTags(userId: string): Promise<CarTagResponse[]> {
    // Ensure default tags exist before fetching
    await ensureDefaultTagsExist();

    const [defaults, custom] = await Promise.all([
      carTagRepository.getDefaults(),
      carTagRepository.findByUserId(userId),
    ]);

    // Return defaults first, then custom tags
    return [...defaults.map(toResponse), ...custom.map(toResponse)];
  },

  /**
   * Create a custom tag for a user
   */
  async createTag(userId: string, input: CreateCarTagRequest): Promise<CarTagResponse> {
    if (!input.name || input.name.trim().length === 0) {
      throw new ValidationError('Tag name is required');
    }

    if (input.name.length > 50) {
      throw new ValidationError('Tag name must be 50 characters or less');
    }

    if (input.color && !/^#[0-9A-Fa-f]{6}$/.test(input.color)) {
      throw new ValidationError('Color must be a valid hex color (e.g., #3B82F6)');
    }

    const tag = await carTagRepository.create({
      userId,
      name: input.name.trim(),
      color: input.color,
    });

    return toResponse(tag);
  },

  /**
   * Update a custom tag
   */
  async updateTag(
    userId: string,
    tagId: string,
    input: UpdateCarTagRequest
  ): Promise<CarTagResponse> {
    const existing = await carTagRepository.findById(tagId);

    if (!existing) {
      throw new NotFoundError('Car tag');
    }

    // Cannot edit default tags
    if (existing.isDefault) {
      throw new AuthorizationError('Cannot edit default tags');
    }

    // Can only edit own tags
    if (existing.userId !== userId) {
      throw new AuthorizationError('Not authorized to edit this tag');
    }

    if (input.name !== undefined && input.name.trim().length === 0) {
      throw new ValidationError('Tag name cannot be empty');
    }

    if (input.name && input.name.length > 50) {
      throw new ValidationError('Tag name must be 50 characters or less');
    }

    if (input.color && !/^#[0-9A-Fa-f]{6}$/.test(input.color)) {
      throw new ValidationError('Color must be a valid hex color (e.g., #3B82F6)');
    }

    const updated = await carTagRepository.update(tagId, {
      name: input.name?.trim(),
      color: input.color,
    });

    return toResponse(updated!);
  },

  /**
   * Delete a custom tag
   */
  async deleteTag(userId: string, tagId: string): Promise<void> {
    const existing = await carTagRepository.findById(tagId);

    if (!existing) {
      throw new NotFoundError('Car tag');
    }

    // Cannot delete default tags
    if (existing.isDefault) {
      throw new AuthorizationError('Cannot delete default tags');
    }

    // Can only delete own tags
    if (existing.userId !== userId) {
      throw new AuthorizationError('Not authorized to delete this tag');
    }

    await carTagRepository.delete(tagId);
  },
};
