// apps/api/src/repositories/refreshToken.repository.ts
import { eq, lt } from 'drizzle-orm';
import { db } from '../config/db.js';
import { refreshTokens } from '@repo/shared/db';

/**
 * Refresh token entity
 */
export interface RefreshToken {
  id: string;
  userId: string;
  tokenHash: string;
  expiresAt: Date;
  createdAt: Date;
}

/**
 * Refresh token creation input
 */
export interface CreateRefreshTokenInput {
  userId: string;
  tokenHash: string;
  expiresAt: Date;
}

/**
 * Maps database row to RefreshToken entity
 */
function mapToRefreshToken(row: typeof refreshTokens.$inferSelect): RefreshToken {
  return {
    id: row.id,
    userId: row.userId,
    tokenHash: row.tokenHash,
    expiresAt: row.expiresAt,
    createdAt: row.createdAt,
  };
}

/**
 * Refresh token repository - data access layer for refresh_tokens table
 */
export const refreshTokenRepository = {
  /**
   * Create a new refresh token record
   */
  async create(input: CreateRefreshTokenInput): Promise<RefreshToken> {
    const rows = await db
      .insert(refreshTokens)
      .values({
        userId: input.userId,
        tokenHash: input.tokenHash,
        expiresAt: input.expiresAt,
      })
      .returning();

    return mapToRefreshToken(rows[0]!);
  },

  /**
   * Find refresh token by its hash
   */
  async findByTokenHash(tokenHash: string): Promise<RefreshToken | null> {
    const rows = await db
      .select()
      .from(refreshTokens)
      .where(eq(refreshTokens.tokenHash, tokenHash))
      .limit(1);

    return rows[0] ? mapToRefreshToken(rows[0]) : null;
  },

  /**
   * Delete all refresh tokens for a user (logout from all devices)
   */
  async deleteByUserId(userId: string): Promise<number> {
    const result = await db
      .delete(refreshTokens)
      .where(eq(refreshTokens.userId, userId))
      .returning({ id: refreshTokens.id });

    return result.length;
  },

  /**
   * Delete a specific refresh token by hash
   */
  async deleteByTokenHash(tokenHash: string): Promise<boolean> {
    const result = await db
      .delete(refreshTokens)
      .where(eq(refreshTokens.tokenHash, tokenHash))
      .returning({ id: refreshTokens.id });

    return result.length > 0;
  },

  /**
   * Delete all expired refresh tokens (cleanup job)
   */
  async deleteExpired(): Promise<number> {
    const result = await db
      .delete(refreshTokens)
      .where(lt(refreshTokens.expiresAt, new Date()))
      .returning({ id: refreshTokens.id });

    return result.length;
  },
};
