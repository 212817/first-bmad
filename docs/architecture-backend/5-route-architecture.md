# 5. Route Architecture

### 5.1 Route Handler Pattern

```typescript
// routes/spots/spots.routes.ts
import { Router } from 'express';
import { authMiddleware } from '@/middleware/auth.middleware';
import { validate } from '@/middleware/validate.middleware';
import { spotsService } from './spots.service';
import { createSpotSchema, updateSpotSchema } from './types';

export const spotsRoutes = Router();

// All routes require authentication
spotsRoutes.use(authMiddleware);

// POST /v1/spots - Create new parking spot
spotsRoutes.post('/', validate(createSpotSchema), async (req, res) => {
  const spot = await spotsService.createSpot(req.user!.id, req.body);
  res.status(201).json({ success: true, data: spot });
});

// GET /v1/spots - List spots (paginated)
spotsRoutes.get('/', async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Math.min(Number(req.query.limit) || 20, 100);

  const result = await spotsService.getSpots(req.user!.id, { page, limit });
  res.json({ success: true, ...result });
});

// GET /v1/spots/active - Get active spot
spotsRoutes.get('/active', async (req, res) => {
  const spot = await spotsService.getActiveSpot(req.user!.id);
  res.json({ success: true, data: spot });
});

// GET /v1/spots/:id - Get spot by ID
spotsRoutes.get('/:id', async (req, res) => {
  const spot = await spotsService.getSpotById(req.user!.id, req.params.id);
  res.json({ success: true, data: spot });
});

// PATCH /v1/spots/:id - Update spot
spotsRoutes.patch('/:id', validate(updateSpotSchema), async (req, res) => {
  const spot = await spotsService.updateSpot(req.user!.id, req.params.id, req.body);
  res.json({ success: true, data: spot });
});

// POST /v1/spots/:id/clear - Mark spot as cleared
spotsRoutes.post('/:id/clear', async (req, res) => {
  const spot = await spotsService.clearSpot(req.user!.id, req.params.id);
  res.json({ success: true, data: spot });
});

// DELETE /v1/spots/:id - Delete spot
spotsRoutes.delete('/:id', async (req, res) => {
  await spotsService.deleteSpot(req.user!.id, req.params.id);
  res.status(204).send();
});
```

### 5.2 Route Types

```typescript
// routes/spots/types.ts
import { z } from 'zod';

export const createSpotSchema = z.object({
  body: z.object({
    latitude: z.number().min(-90).max(90),
    longitude: z.number().min(-180).max(180),
    photoUrl: z.string().url().optional(),
    note: z.string().max(500).optional(),
    floor: z.string().max(50).optional(),
    spotIdentifier: z.string().max(100).optional(),
    tags: z.array(z.string().max(100)).max(10).optional(),
  }),
});

export const updateSpotSchema = z.object({
  body: z.object({
    note: z.string().max(500).optional(),
    floor: z.string().max(50).optional(),
    spotIdentifier: z.string().max(100).optional(),
  }),
});

export type CreateSpotInput = z.infer<typeof createSpotSchema>['body'];
export type UpdateSpotInput = z.infer<typeof updateSpotSchema>['body'];
```

---
