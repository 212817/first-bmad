// apps/api/test/unit/user.repository.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userRepository } from '../../src/repositories/user.repository.js';
import { db } from '../../src/config/db.js';
import { users } from '@repo/shared/db';

// Mock the database
vi.mock('../../src/config/db.js', () => ({
    db: {
        select: vi.fn(),
        insert: vi.fn(),
        update: vi.fn(),
    },
}));

vi.mock('@repo/shared/db', () => ({
    users: {
        id: 'id',
        email: 'email',
        provider: 'provider',
        providerId: 'providerId',
    },
}));

describe('UserRepository', () => {
    const mockDbRow = {
        id: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User',
        avatarUrl: 'https://example.com/avatar.jpg',
        provider: 'google',
        providerId: 'google-123',
        createdAt: new Date('2025-01-01'),
        updatedAt: new Date('2025-01-02'),
        lastLoginAt: new Date('2025-01-03'),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('findByProviderAndId', () => {
        it('should return user when found', async () => {
            const mockSelect = vi.fn().mockReturnThis();
            const mockFrom = vi.fn().mockReturnThis();
            const mockWhere = vi.fn().mockReturnThis();
            const mockLimit = vi.fn().mockResolvedValue([mockDbRow]);

            vi.mocked(db.select).mockReturnValue({
                from: mockFrom,
            } as any);
            mockFrom.mockReturnValue({ where: mockWhere });
            mockWhere.mockReturnValue({ limit: mockLimit });

            const result = await userRepository.findByProviderAndId('google', 'google-123');

            expect(result).not.toBeNull();
            expect(result?.id).toBe('user-123');
            expect(result?.email).toBe('test@example.com');
            expect(result?.provider).toBe('google');
        });

        it('should return null when user not found', async () => {
            const mockFrom = vi.fn().mockReturnThis();
            const mockWhere = vi.fn().mockReturnThis();
            const mockLimit = vi.fn().mockResolvedValue([]);

            vi.mocked(db.select).mockReturnValue({
                from: mockFrom,
            } as any);
            mockFrom.mockReturnValue({ where: mockWhere });
            mockWhere.mockReturnValue({ limit: mockLimit });

            const result = await userRepository.findByProviderAndId('google', 'nonexistent');

            expect(result).toBeNull();
        });
    });

    describe('findById', () => {
        it('should return user when found', async () => {
            const mockFrom = vi.fn().mockReturnThis();
            const mockWhere = vi.fn().mockReturnThis();
            const mockLimit = vi.fn().mockResolvedValue([mockDbRow]);

            vi.mocked(db.select).mockReturnValue({
                from: mockFrom,
            } as any);
            mockFrom.mockReturnValue({ where: mockWhere });
            mockWhere.mockReturnValue({ limit: mockLimit });

            const result = await userRepository.findById('user-123');

            expect(result).not.toBeNull();
            expect(result?.id).toBe('user-123');
        });

        it('should return null when user not found', async () => {
            const mockFrom = vi.fn().mockReturnThis();
            const mockWhere = vi.fn().mockReturnThis();
            const mockLimit = vi.fn().mockResolvedValue([]);

            vi.mocked(db.select).mockReturnValue({
                from: mockFrom,
            } as any);
            mockFrom.mockReturnValue({ where: mockWhere });
            mockWhere.mockReturnValue({ limit: mockLimit });

            const result = await userRepository.findById('nonexistent');

            expect(result).toBeNull();
        });
    });

    describe('findByEmail', () => {
        it('should return user when found', async () => {
            const mockFrom = vi.fn().mockReturnThis();
            const mockWhere = vi.fn().mockReturnThis();
            const mockLimit = vi.fn().mockResolvedValue([mockDbRow]);

            vi.mocked(db.select).mockReturnValue({
                from: mockFrom,
            } as any);
            mockFrom.mockReturnValue({ where: mockWhere });
            mockWhere.mockReturnValue({ limit: mockLimit });

            const result = await userRepository.findByEmail('test@example.com');

            expect(result).not.toBeNull();
            expect(result?.email).toBe('test@example.com');
        });

        it('should return null when user not found', async () => {
            const mockFrom = vi.fn().mockReturnThis();
            const mockWhere = vi.fn().mockReturnThis();
            const mockLimit = vi.fn().mockResolvedValue([]);

            vi.mocked(db.select).mockReturnValue({
                from: mockFrom,
            } as any);
            mockFrom.mockReturnValue({ where: mockWhere });
            mockWhere.mockReturnValue({ limit: mockLimit });

            const result = await userRepository.findByEmail('nonexistent@example.com');

            expect(result).toBeNull();
        });
    });

    describe('create', () => {
        it('should create and return new user', async () => {
            const mockValues = vi.fn().mockReturnThis();
            const mockReturning = vi.fn().mockResolvedValue([mockDbRow]);

            vi.mocked(db.insert).mockReturnValue({
                values: mockValues,
            } as any);
            mockValues.mockReturnValue({ returning: mockReturning });

            const result = await userRepository.create({
                email: 'test@example.com',
                displayName: 'Test User',
                avatarUrl: 'https://example.com/avatar.jpg',
                provider: 'google',
                providerId: 'google-123',
            });

            expect(result.id).toBe('user-123');
            expect(result.email).toBe('test@example.com');
            expect(result.provider).toBe('google');
        });
    });

    describe('updateLastLogin', () => {
        it('should update and return user', async () => {
            const mockSet = vi.fn().mockReturnThis();
            const mockWhere = vi.fn().mockReturnThis();
            const mockReturning = vi.fn().mockResolvedValue([mockDbRow]);

            vi.mocked(db.update).mockReturnValue({
                set: mockSet,
            } as any);
            mockSet.mockReturnValue({ where: mockWhere });
            mockWhere.mockReturnValue({ returning: mockReturning });

            const result = await userRepository.updateLastLogin('user-123');

            expect(result).not.toBeNull();
            expect(result?.id).toBe('user-123');
        });

        it('should return null when user not found', async () => {
            const mockSet = vi.fn().mockReturnThis();
            const mockWhere = vi.fn().mockReturnThis();
            const mockReturning = vi.fn().mockResolvedValue([]);

            vi.mocked(db.update).mockReturnValue({
                set: mockSet,
            } as any);
            mockSet.mockReturnValue({ where: mockWhere });
            mockWhere.mockReturnValue({ returning: mockReturning });

            const result = await userRepository.updateLastLogin('nonexistent');

            expect(result).toBeNull();
        });
    });
});
