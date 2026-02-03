// apps/api/src/routes/geocode/geocode.routes.ts
import { Router, type Router as RouterType } from 'express';
import { authMiddleware } from '../../middleware/auth.middleware.js';
import { geocodingRateLimiter } from '../../middleware/rateLimit.middleware.js';
import { geocodeRouteService } from './geocode.service.js';
import type { GeocodeRequest, ReverseGeocodeRequest } from './types.js';

export const geocodeRoutes: RouterType = Router();

// All geocode routes require authentication
geocodeRoutes.use(authMiddleware);

/**
 * POST /geocode
 * Geocode an address to coordinates
 * Rate limited to 10 requests per minute per user
 */
geocodeRoutes.post('/', geocodingRateLimiter, async (req, res) => {
  const { address } = req.body as GeocodeRequest;

  const result = await geocodeRouteService.geocodeAddress(address);

  res.json({ success: true, data: result });
});

/**
 * POST /geocode/reverse
 * Reverse geocode coordinates to address
 * Rate limited to 10 requests per minute per user
 */
geocodeRoutes.post('/reverse', geocodingRateLimiter, async (req, res) => {
  const { lat, lng } = req.body as ReverseGeocodeRequest;

  const result = await geocodeRouteService.reverseGeocode(lat, lng);

  res.json({ success: true, data: result });
});
