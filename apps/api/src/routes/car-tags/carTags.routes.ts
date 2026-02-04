// apps/api/src/routes/car-tags/carTags.routes.ts
import { Router, type Router as RouterType } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { carTagsService } from './carTags.service.js';
import type { CreateCarTagRequest, UpdateCarTagRequest } from './types.js';

export const carTagsRoutes: RouterType = Router();

// All car-tags routes require authentication
carTagsRoutes.use(authMiddleware);

/**
 * GET /car-tags
 * Get all tags for the user (defaults + custom)
 */
carTagsRoutes.get('/', async (req, res) => {
  const tags = await carTagsService.getAllTags(req.user!.id);

  res.json({ success: true, data: tags });
});

/**
 * POST /car-tags
 * Create a custom car tag
 */
carTagsRoutes.post('/', async (req, res) => {
  const input = req.body as CreateCarTagRequest;
  const tag = await carTagsService.createTag(req.user!.id, input);

  res.status(201).json({ success: true, data: tag });
});

/**
 * PATCH /car-tags/:id
 * Update a custom car tag
 */
carTagsRoutes.patch('/:id', async (req, res) => {
  const input = req.body as UpdateCarTagRequest;
  const tag = await carTagsService.updateTag(req.user!.id, req.params.id as string, input);

  res.json({ success: true, data: tag });
});

/**
 * DELETE /car-tags/:id
 * Delete a custom car tag
 */
carTagsRoutes.delete('/:id', async (req, res) => {
  await carTagsService.deleteTag(req.user!.id, req.params.id as string);

  res.status(204).send();
});
