# 7. Repository Layer

### 7.1 Repository Pattern

```typescript
// repositories/spot.repository.ts
import { db } from '@/config/db';
import { parkingSpots, carTags } from '@repo/shared/db';
import { eq, and, desc } from 'drizzle-orm';
import type { ParkingSpot, NewParkingSpot } from '@repo/shared/db/types';

export const spotRepository = {
  create: async (data: NewParkingSpot): Promise<ParkingSpot> => {
    const [spot] = await db.insert(parkingSpots).values(data).returning();
    return spot;
  },

  findById: async (id: string): Promise<ParkingSpot | null> => {
    const [spot] = await db.select().from(parkingSpots).where(eq(parkingSpots.id, id)).limit(1);
    return spot || null;
  },

  findActiveByUser: async (userId: string): Promise<ParkingSpot | null> => {
    const [spot] = await db
      .select()
      .from(parkingSpots)
      .where(and(eq(parkingSpots.userId, userId), eq(parkingSpots.isActive, true)))
      .limit(1);
    return spot || null;
  },

  findByUser: async (
    userId: string,
    options: { page: number; limit: number }
  ): Promise<ParkingSpot[]> => {
    const offset = (options.page - 1) * options.limit;
    return db
      .select()
      .from(parkingSpots)
      .where(eq(parkingSpots.userId, userId))
      .orderBy(desc(parkingSpots.createdAt))
      .limit(options.limit)
      .offset(offset);
  },

  countByUser: async (userId: string): Promise<number> => {
    const result = await db
      .select({ count: sql<number>`count(*)` })
      .from(parkingSpots)
      .where(eq(parkingSpots.userId, userId));
    return Number(result[0]?.count || 0);
  },

  update: async (id: string, data: Partial<ParkingSpot>): Promise<ParkingSpot> => {
    const [spot] = await db
      .update(parkingSpots)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(parkingSpots.id, id))
      .returning();
    return spot;
  },

  deactivateUserSpots: async (userId: string): Promise<void> => {
    await db
      .update(parkingSpots)
      .set({ isActive: false, updatedAt: new Date() })
      .where(and(eq(parkingSpots.userId, userId), eq(parkingSpots.isActive, true)));
  },

  delete: async (id: string): Promise<void> => {
    await db.delete(parkingSpots).where(eq(parkingSpots.id, id));
  },

  addTags: async (spotId: string, labels: string[]): Promise<void> => {
    const tags = labels.map((label) => ({ spotId, label }));
    await db.insert(carTags).values(tags);
  },
};
```

---
