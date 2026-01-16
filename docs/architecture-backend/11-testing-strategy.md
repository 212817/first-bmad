# 11. Testing Strategy

### 11.1 Coverage Targets

| Category     | Target | Tool               |
| ------------ | ------ | ------------------ |
| Services     | 100%   | Vitest             |
| Repositories | 95%    | Vitest             |
| Routes       | 100%   | Vitest + Supertest |
| Middleware   | 95%    | Vitest             |

### 11.2 Test Setup

```typescript
// test/setup.ts
import { beforeAll, afterAll, beforeEach } from 'vitest';
import { db, testDb } from './helpers/testDb';

beforeAll(async () => {
  await testDb.migrate();
});

beforeEach(async () => {
  await testDb.truncateAll();
});

afterAll(async () => {
  await testDb.close();
});
```

### 11.3 Service Test Example

```typescript
// routes/spots/__tests__/spots.service.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { spotsService } from '../spots.service';
import { spotRepository } from '@/repositories/spot.repository';
import { NotFoundError } from '@repo/shared/errors';

vi.mock('@/repositories/spot.repository');

describe('spotsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getSpotById', () => {
    it('should return spot when found and owned by user', async () => {
      const mockSpot = { id: 'spot-1', userId: 'user-1' };
      vi.mocked(spotRepository.findById).mockResolvedValue(mockSpot as any);

      const result = await spotsService.getSpotById('user-1', 'spot-1');

      expect(result).toEqual(mockSpot);
    });

    it('should throw NotFoundError when spot not found', async () => {
      vi.mocked(spotRepository.findById).mockResolvedValue(null);

      await expect(spotsService.getSpotById('user-1', 'spot-1')).rejects.toThrow(NotFoundError);
    });

    it('should throw AuthorizationError when user does not own spot', async () => {
      const mockSpot = { id: 'spot-1', userId: 'other-user' };
      vi.mocked(spotRepository.findById).mockResolvedValue(mockSpot as any);

      await expect(spotsService.getSpotById('user-1', 'spot-1')).rejects.toThrow('Not authorized');
    });
  });
});
```

### 11.4 Integration Test Example

```typescript
// test/integration/spots.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import request from 'supertest';
import { createApp } from '@/app';
import { testDb } from '../helpers/testDb';
import { jwtService } from '@/services/jwt/jwt.service';

describe('Spots API', () => {
  const app = createApp();
  let authToken: string;
  let userId: string;

  beforeEach(async () => {
    // Create test user
    const user = await testDb.createUser({ email: 'test@example.com' });
    userId = user.id;
    authToken = jwtService.generateAccessToken(userId, user.email);
  });

  describe('POST /v1/spots', () => {
    it('should create a new parking spot', async () => {
      const response = await request(app)
        .post('/v1/spots')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          latitude: 40.7128,
          longitude: -74.006,
          note: 'Near the entrance',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toMatchObject({
        latitude: '40.7128000',
        longitude: '-74.0060000',
        note: 'Near the entrance',
        isActive: true,
      });
    });

    it('should require authentication', async () => {
      const response = await request(app)
        .post('/v1/spots')
        .send({ latitude: 40.7128, longitude: -74.006 });

      expect(response.status).toBe(401);
    });
  });
});
```

---
