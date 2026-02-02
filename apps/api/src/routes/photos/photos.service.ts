// apps/api/src/routes/photos/photos.service.ts
import { r2Service } from '../../services/r2/r2.service.js';
import { AuthorizationError } from '@repo/shared/errors';
import type { GetUploadUrlResponse } from './types.js';

/**
 * Valid image content types
 */
const VALID_CONTENT_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

/**
 * Valid file extensions
 */
const VALID_EXTENSIONS = ['jpg', 'jpeg', 'png', 'webp'];

/**
 * Photos service - business logic for photo operations
 */
export const photosService = {
  /**
   * Generate a pre-signed upload URL for a user
   */
  async getUploadUrl(
    userId: string,
    extension = 'jpg',
    contentType = 'image/jpeg'
  ): Promise<GetUploadUrlResponse> {
    // Validate extension
    const normalizedExt = extension.toLowerCase();
    if (!VALID_EXTENSIONS.includes(normalizedExt)) {
      throw new AuthorizationError(`Invalid file extension: ${extension}`);
    }

    // Validate content type
    if (!VALID_CONTENT_TYPES.includes(contentType)) {
      throw new AuthorizationError(`Invalid content type: ${contentType}`);
    }

    // Generate unique key and upload URL
    const key = r2Service.generatePhotoKey(userId, normalizedExt);
    const result = await r2Service.generateUploadUrl(key, contentType);

    return {
      uploadUrl: result.uploadUrl,
      key: result.key,
      publicUrl: result.publicUrl,
      expiresIn: result.expiresIn,
    };
  },

  /**
   * Delete a photo from storage
   * Only allows deleting photos owned by the user (key must start with photos/{userId}/)
   */
  async deletePhoto(userId: string, key: string): Promise<void> {
    // Verify the key belongs to this user
    const expectedPrefix = `photos/${userId}/`;
    if (!key.startsWith(expectedPrefix)) {
      throw new AuthorizationError('Not authorized to delete this photo');
    }

    await r2Service.deleteObject(key);
  },
};
