# 12. Coding Standards

### 12.1 Critical Rules

1. ✅ **Types in `types.ts`** per route/service folder
2. ✅ **No try/catch in routes** - let errors propagate to middleware
3. ✅ **Services throw typed errors** - use AppError subclasses
4. ✅ **Repositories return null** - not throw on not found
5. ✅ **Validate all input** - Zod schemas for every endpoint
6. ✅ **Verify ownership** - check userId before any operation

### 12.2 Naming Conventions

| Item         | Convention                     | Example           |
| ------------ | ------------------------------ | ----------------- |
| Routes       | kebab-case file, Router export | `spots.routes.ts` |
| Services     | camelCase object               | `spotsService`    |
| Repositories | camelCase object               | `spotRepository`  |
| Middleware   | camelCase function             | `authMiddleware`  |
| Types        | PascalCase                     | `CreateSpotInput` |
| Env vars     | UPPER_SNAKE                    | `DATABASE_URL`    |

### 12.3 Error Handling Pattern

```typescript
// ✅ DO: Services throw typed errors
async function getSpotById(userId: string, spotId: string) {
  const spot = await spotRepository.findById(spotId);

  if (!spot) {
    throw new NotFoundError('Parking spot');
  }

  if (spot.userId !== userId) {
    throw new AuthorizationError('Not authorized');
  }

  return spot;
}

// ✅ DO: Routes let errors propagate
router.get('/:id', async (req, res) => {
  const spot = await spotsService.getSpotById(req.user!.id, req.params.id);
  res.json({ success: true, data: spot });
});

// ❌ DON'T: Catch errors in routes
router.get('/:id', async (req, res) => {
  try {
    const spot = await spotsService.getSpotById(req.user!.id, req.params.id);
    res.json({ success: true, data: spot });
  } catch (error) {
    // Don't do this - let middleware handle it
  }
});
```

---
