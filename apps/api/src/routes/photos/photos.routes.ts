// apps/api/src/routes/photos/photos.routes.ts
import { Router, type Router as RouterType } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { photosService } from './photos.service.js';
import type { GetUploadUrlRequest } from './types.js';

export const photosRoutes: RouterType = Router();

// All photos routes require authentication
photosRoutes.use(authMiddleware);

/**
 * POST /photos/upload-url
 * Generate a pre-signed URL for uploading a photo
 */
photosRoutes.post('/upload-url', async (req, res) => {
  const { extension, contentType } = req.body as GetUploadUrlRequest;

  const result = await photosService.getUploadUrl(req.user!.id, extension, contentType);

  res.json({ success: true, data: result });
});

/**
 * DELETE /photos/:key
 * Delete a photo from storage
 * Key is URL-encoded in the path parameter (supports paths with slashes)
 */
photosRoutes.delete('/:key{/*path}', async (req, res) => {
  // Reconstruct full key from params (key + optional nested path)
  const { key, path } = req.params;
  const fullKey = path ? `${key}/${path}` : key;
  const decodedKey = decodeURIComponent(fullKey);

  await photosService.deletePhoto(req.user!.id, decodedKey);

  res.json({ success: true, data: null });
});
