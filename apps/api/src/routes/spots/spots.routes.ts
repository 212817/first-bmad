// apps/api/src/routes/spots/spots.routes.ts
import { Router, type Router as RouterType } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { spotsService } from './spots.service.js';
import type { CreateSpotRequest, UpdateSpotRequest } from './types.js';

export const spotsRoutes: RouterType = Router();

// All spots routes require authentication
spotsRoutes.use(authMiddleware);

/**
 * POST /spots
 * Create a new parking spot
 */
spotsRoutes.post('/', async (req, res) => {
  const input = req.body as CreateSpotRequest;
  const spot = await spotsService.createSpot(req.user!.id, input);

  res.status(201).json({ success: true, data: spot });
});

/**
 * GET /spots
 * Get user's parking spots (paginated)
 */
spotsRoutes.get('/', async (req, res) => {
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
  const spots = await spotsService.getUserSpots(req.user!.id, limit);

  res.json({
    success: true,
    data: spots,
    meta: { limit, total: spots.length },
  });
});

/**
 * GET /spots/active
 * Get user's current active spot
 */
spotsRoutes.get('/active', async (req, res) => {
  const spot = await spotsService.getActiveSpot(req.user!.id);

  res.json({ success: true, data: spot });
});

/**
 * GET /spots/latest
 * Get user's most recent spot (for home screen display)
 */
spotsRoutes.get('/latest', async (req, res) => {
  const spot = await spotsService.getLatestSpot(req.user!.id);

  if (!spot) {
    res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'No spots found' },
    });
    return;
  }

  res.json({ success: true, data: spot });
});

/**
 * GET /spots/:id
 * Get a specific spot by ID
 */
spotsRoutes.get('/:id', async (req, res) => {
  const spot = await spotsService.getSpotById(req.user!.id, req.params.id);

  res.json({ success: true, data: spot });
});

/**
 * PATCH /spots/:id
 * Update a spot
 */
spotsRoutes.patch('/:id', async (req, res) => {
  const input = req.body as UpdateSpotRequest;
  const spot = await spotsService.updateSpot(req.user!.id, req.params.id, input);

  res.json({ success: true, data: spot });
});

/**
 * POST /spots/:id/clear
 * Mark a spot as cleared/inactive
 */
spotsRoutes.post('/:id/clear', async (req, res) => {
  const spot = await spotsService.clearSpot(req.user!.id, req.params.id);

  res.json({ success: true, data: spot });
});

/**
 * DELETE /spots/:id
 * Delete a spot
 */
spotsRoutes.delete('/:id', async (req, res) => {
  await spotsService.deleteSpot(req.user!.id, req.params.id);

  res.status(204).send();
});
