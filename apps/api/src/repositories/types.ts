// apps/api/src/repositories/types.ts
import type { AuthProvider, User } from '@repo/shared/types';

/**
 * User creation input
 */
export interface CreateUserInput {
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
  provider: AuthProvider;
  providerId: string;
}

/**
 * User repository interface
 */
export interface UserRepositoryInterface {
  findByProviderAndId(provider: AuthProvider, providerId: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  create(input: CreateUserInput): Promise<User>;
  updateLastLogin(userId: string): Promise<User | null>;
}
