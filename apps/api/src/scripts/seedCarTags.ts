// apps/api/src/scripts/seedCarTags.ts
import { config } from 'dotenv';
import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import { carTags } from '@repo/shared/db';

// Load .env from monorepo root
config({ path: '../../.env' });

const DEFAULT_TAGS = [
  { name: 'My Car', color: '#3B82F6', isDefault: true },
  { name: 'Rental', color: '#10B981', isDefault: true },
  { name: 'Other', color: '#6B7280', isDefault: true },
];

const seed = async () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL environment variable is required');
  }

  const sql = neon(databaseUrl);
  const db = drizzle(sql);

  console.log('Seeding default car tags...');

  for (const tag of DEFAULT_TAGS) {
    try {
      await db
        .insert(carTags)
        .values({
          userId: null, // null = system default
          name: tag.name,
          color: tag.color,
          isDefault: tag.isDefault,
        })
        .onConflictDoNothing();
      console.log(`  ✓ Created tag: ${tag.name}`);
    } catch {
      console.log(`  - Tag "${tag.name}" may already exist, skipping`);
    }
  }

  console.log('Done!');
};

seed().catch(console.error);
