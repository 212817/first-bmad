// apps/api/src/routes/share/share.routes.ts
import { Router, type Router as RouterType } from 'express';
import { shareService } from './share.service.js';

export const shareRoutes: RouterType = Router();

// NOTE: No authMiddleware - these routes are PUBLIC

/**
 * GET /share/:token
 * Get shared spot by token (public, no auth required)
 */
shareRoutes.get('/:token', async (req, res) => {
  const { token } = req.params;

  const spot = await shareService.getSharedSpot(token);

  res.json({ success: true, data: spot });
});
