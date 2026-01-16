// apps/api/src/repositories/user.repository.ts
import { eq, and } from 'drizzle-orm';
import { db } from '../config/db.js';
import { users } from '@repo/shared/db';
import type { User, AuthProvider } from '@repo/shared/types';
import type { CreateUserInput, UserRepositoryInterface } from './types.js';

/**
 * Maps database row to User entity
 */
function mapToUser(row: typeof users.$inferSelect): User {
  return {
    id: row.id,
    email: row.email,
    displayName: row.displayName,
    avatarUrl: row.avatarUrl,
    provider: row.provider as AuthProvider,
    providerId: row.providerId,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    lastLoginAt: row.lastLoginAt,
  };
}

/**
 * User repository - data access layer for users table
 */
export const userRepository: UserRepositoryInterface = {
  /**
   * Find user by OAuth provider and provider ID
   */
  async findByProviderAndId(provider: AuthProvider, providerId: string): Promise<User | null> {
    const rows = await db
      .select()
      .from(users)
      .where(and(eq(users.provider, provider), eq(users.providerId, providerId)))
      .limit(1);

    return rows[0] ? mapToUser(rows[0]) : null;
  },

  /**
   * Find user by ID
   */
  async findById(id: string): Promise<User | null> {
    const rows = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return rows[0] ? mapToUser(rows[0]) : null;
  },

  /**
   * Find user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    const rows = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return rows[0] ? mapToUser(rows[0]) : null;
  },

  /**
   * Create a new user
   */
  async create(input: CreateUserInput): Promise<User> {
    const rows = await db
      .insert(users)
      .values({
        email: input.email,
        displayName: input.displayName,
        avatarUrl: input.avatarUrl,
        provider: input.provider,
        providerId: input.providerId,
      })
      .returning();

    return mapToUser(rows[0]!);
  },

  /**
   * Update user's last login timestamp
   */
  async updateLastLogin(userId: string): Promise<User | null> {
    const rows = await db
      .update(users)
      .set({
        lastLoginAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    return rows[0] ? mapToUser(rows[0]) : null;
  },
};
