// apps/api/src/scripts/fixNullCarTagIds.ts
import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { eq, isNull } from 'drizzle-orm';
import { carTags, parkingSpots } from '@repo/shared/db';

// Load .env from monorepo root
config({ path: '../../.env' });

/**
 * Migration script to update existing spots with null carTagId
 * Sets them to the default "My Car" tag ID
 */
const migrate = async () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const sql = neon(databaseUrl);
  const db = drizzle(sql);

  console.log('Looking up "My Car" default tag...');

  // Find the "My Car" default tag
  const myCarTagRows = await db.select().from(carTags).where(eq(carTags.name, 'My Car')).limit(1);

  if (myCarTagRows.length === 0) {
    console.error('Error: "My Car" default tag not found. Run seedCarTags.ts first.');
    process.exit(1);
  }

  const myCarTag = myCarTagRows[0]!;
  console.log(`  ✓ Found "My Car" tag with ID: ${myCarTag.id}`);

  console.log('Updating spots with null carTagId...');

  // Update all spots with null carTagId
  const result = await db
    .update(parkingSpots)
    .set({ carTagId: myCarTag.id })
    .where(isNull(parkingSpots.carTagId))
    .returning({ id: parkingSpots.id });

  console.log(`  ✓ Updated ${result.length} spots to use "My Car" tag`);
  console.log('Done!');
};

migrate().catch(console.error);
