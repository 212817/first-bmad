// apps/api/test/unit/auth.service.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from '../../src/routes/auth/auth.service.js';
import { userRepository } from '../../src/repositories/user.repository.js';
import { refreshTokenRepository } from '../../src/repositories/refreshToken.repository.js';
import { jwtService } from '../../src/services/jwt/jwt.service.js';
import { AuthenticationError } from '@repo/shared/errors';

// Mock dependencies
vi.mock('../../src/repositories/user.repository.js');
vi.mock('../../src/repositories/refreshToken.repository.js');
vi.mock('../../src/services/jwt/jwt.service.js');

// Mock global fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('AuthService', () => {
    const mockUser = {
        id: 'user-123',
        email: 'test@example.com',
        displayName: 'Test User',
        avatarUrl: 'https://example.com/avatar.jpg',
        provider: 'google' as const,
        providerId: 'google-123',
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: new Date(),
    };

    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getGoogleAuthUrl', () => {
        it('should return a valid Google OAuth URL', () => {
            const redirectUri = 'http://localhost:3001/auth/google/callback';
            const url = authService.getGoogleAuthUrl(redirectUri);

            expect(url).toContain('accounts.google.com');
            expect(url).toContain('client_id=');
            expect(url).toContain('redirect_uri=');
            expect(url).toContain('response_type=code');
            expect(url).toContain('scope=');
            expect(url).toContain('state=');
        });

        it('should include the correct redirect_uri', () => {
            const redirectUri = 'http://localhost:3001/auth/google/callback';
            const url = authService.getGoogleAuthUrl(redirectUri);

            expect(url).toContain(encodeURIComponent(redirectUri));
        });
    });

    describe('exchangeCodeForTokens', () => {
        it('should exchange code for tokens successfully', async () => {
            const mockTokenResponse = {
                access_token: 'mock-access-token',
                refresh_token: 'mock-refresh-token',
                id_token: 'mock-id-token',
                expires_in: 3600,
                token_type: 'Bearer',
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockTokenResponse),
            });

            const result = await authService.exchangeCodeForTokens(
                'test-code',
                'http://localhost:3001/callback'
            );

            expect(result).toEqual(mockTokenResponse);
            expect(mockFetch).toHaveBeenCalledWith(
                'https://oauth2.googleapis.com/token',
                expect.objectContaining({
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                })
            );
        });

        it('should throw AuthenticationError on failed token exchange', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
                text: () => Promise.resolve('Invalid code'),
            });

            await expect(
                authService.exchangeCodeForTokens('invalid-code', 'http://localhost:3001/callback')
            ).rejects.toThrow(AuthenticationError);
        });
    });

    describe('getGoogleUserInfo', () => {
        it('should fetch user info successfully', async () => {
            const mockUserInfo = {
                sub: 'google-123',
                email: 'test@example.com',
                name: 'Test User',
                picture: 'https://example.com/avatar.jpg',
            };

            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve(mockUserInfo),
            });

            const result = await authService.getGoogleUserInfo('mock-access-token');

            expect(result).toEqual(mockUserInfo);
            expect(mockFetch).toHaveBeenCalledWith(
                'https://www.googleapis.com/oauth2/v3/userinfo',
                expect.objectContaining({
                    headers: { Authorization: 'Bearer mock-access-token' },
                })
            );
        });

        it('should throw AuthenticationError on failed user info fetch', async () => {
            mockFetch.mockResolvedValueOnce({
                ok: false,
            });

            await expect(authService.getGoogleUserInfo('invalid-token')).rejects.toThrow(
                AuthenticationError
            );
        });
    });

    describe('handleGoogleCallback', () => {
        beforeEach(() => {
            vi.mocked(jwtService.generateAccessToken).mockReturnValue('mock-access-token');
            vi.mocked(jwtService.generateRefreshToken).mockReturnValue('mock-refresh-token');
            vi.mocked(jwtService.hashToken).mockReturnValue('mock-hash');
            vi.mocked(refreshTokenRepository.create).mockResolvedValue({
                id: 'token-1',
                userId: mockUser.id,
                tokenHash: 'mock-hash',
                expiresAt: new Date(),
                createdAt: new Date(),
            });
        });

        it('should create new user on first login', async () => {
            // Mock token exchange
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () =>
                    Promise.resolve({
                        access_token: 'google-access-token',
                        refresh_token: 'google-refresh-token',
                    }),
            });

            // Mock user info fetch
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () =>
                    Promise.resolve({
                        sub: 'google-123',
                        email: 'test@example.com',
                        name: 'Test User',
                        picture: 'https://example.com/avatar.jpg',
                    }),
            });

            // User doesn't exist
            vi.mocked(userRepository.findByProviderAndId).mockResolvedValue(null);
            vi.mocked(userRepository.create).mockResolvedValue(mockUser);

            const result = await authService.handleGoogleCallback(
                'test-code',
                'http://localhost:3001/callback'
            );

            expect(result.user).toEqual(mockUser);
            expect(result.accessToken).toBe('mock-access-token');
            expect(result.refreshToken).toBe('mock-refresh-token');
            expect(userRepository.create).toHaveBeenCalled();
        });

        it('should update last login for existing user', async () => {
            // Mock token exchange
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () => Promise.resolve({ access_token: 'google-access-token' }),
            });

            // Mock user info fetch
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: () =>
                    Promise.resolve({
                        sub: 'google-123',
                        email: 'test@example.com',
                    }),
            });

            // User exists
            vi.mocked(userRepository.findByProviderAndId).mockResolvedValue(mockUser);
            vi.mocked(userRepository.updateLastLogin).mockResolvedValue(mockUser);

            const result = await authService.handleGoogleCallback(
                'test-code',
                'http://localhost:3001/callback'
            );

            expect(result.user).toEqual(mockUser);
            expect(userRepository.updateLastLogin).toHaveBeenCalledWith(mockUser.id);
            expect(userRepository.create).not.toHaveBeenCalled();
        });
    });

    describe('refreshAccessToken', () => {
        it('should refresh access token successfully', async () => {
            const mockStoredToken = {
                id: 'token-1',
                userId: mockUser.id,
                tokenHash: 'mock-hash',
                expiresAt: new Date(Date.now() + 86400000), // Future date
                createdAt: new Date(),
            };

            vi.mocked(jwtService.verifyRefreshToken).mockReturnValue({
                sub: mockUser.id,
                type: 'refresh',
                iat: 0,
                exp: 0,
            });
            vi.mocked(jwtService.hashToken).mockReturnValue('mock-hash');
            vi.mocked(refreshTokenRepository.findByTokenHash).mockResolvedValue(mockStoredToken);
            vi.mocked(userRepository.findById).mockResolvedValue(mockUser);
            vi.mocked(jwtService.generateAccessToken).mockReturnValue('new-access-token');

            const result = await authService.refreshAccessToken('valid-refresh-token');

            expect(result.accessToken).toBe('new-access-token');
            expect(result.user).toEqual(mockUser);
        });

        it('should throw error for invalid refresh token', async () => {
            vi.mocked(jwtService.verifyRefreshToken).mockReturnValue(null);

            await expect(authService.refreshAccessToken('invalid-token')).rejects.toThrow(
                AuthenticationError
            );
        });

        it('should throw error when token not found in database', async () => {
            vi.mocked(jwtService.verifyRefreshToken).mockReturnValue({
                sub: mockUser.id,
                type: 'refresh',
                iat: 0,
                exp: 0,
            });
            vi.mocked(jwtService.hashToken).mockReturnValue('mock-hash');
            vi.mocked(refreshTokenRepository.findByTokenHash).mockResolvedValue(null);

            await expect(authService.refreshAccessToken('unknown-token')).rejects.toThrow(
                AuthenticationError
            );
        });

        it('should throw error and delete expired token', async () => {
            const expiredToken = {
                id: 'token-1',
                userId: mockUser.id,
                tokenHash: 'mock-hash',
                expiresAt: new Date(Date.now() - 86400000), // Past date
                createdAt: new Date(),
            };

            vi.mocked(jwtService.verifyRefreshToken).mockReturnValue({
                sub: mockUser.id,
                type: 'refresh',
                iat: 0,
                exp: 0,
            });
            vi.mocked(jwtService.hashToken).mockReturnValue('mock-hash');
            vi.mocked(refreshTokenRepository.findByTokenHash).mockResolvedValue(expiredToken);

            await expect(authService.refreshAccessToken('expired-token')).rejects.toThrow(
                AuthenticationError
            );
            expect(refreshTokenRepository.deleteByTokenHash).toHaveBeenCalledWith('mock-hash');
        });

        it('should throw error when user not found', async () => {
            const mockStoredToken = {
                id: 'token-1',
                userId: mockUser.id,
                tokenHash: 'mock-hash',
                expiresAt: new Date(Date.now() + 86400000),
                createdAt: new Date(),
            };

            vi.mocked(jwtService.verifyRefreshToken).mockReturnValue({
                sub: mockUser.id,
                type: 'refresh',
                iat: 0,
                exp: 0,
            });
            vi.mocked(jwtService.hashToken).mockReturnValue('mock-hash');
            vi.mocked(refreshTokenRepository.findByTokenHash).mockResolvedValue(mockStoredToken);
            vi.mocked(userRepository.findById).mockResolvedValue(null);

            await expect(authService.refreshAccessToken('valid-token')).rejects.toThrow(
                AuthenticationError
            );
        });
    });

    describe('getCurrentUser', () => {
        it('should return user when found', async () => {
            vi.mocked(userRepository.findById).mockResolvedValue(mockUser);

            const result = await authService.getCurrentUser(mockUser.id);

            expect(result).toEqual(mockUser);
        });

        it('should throw error when user not found', async () => {
            vi.mocked(userRepository.findById).mockResolvedValue(null);

            await expect(authService.getCurrentUser('unknown-id')).rejects.toThrow(AuthenticationError);
        });
    });

    describe('logout', () => {
        it('should delete refresh token', async () => {
            vi.mocked(jwtService.hashToken).mockReturnValue('mock-hash');
            vi.mocked(refreshTokenRepository.deleteByTokenHash).mockResolvedValue(true);

            await authService.logout('refresh-token');

            expect(refreshTokenRepository.deleteByTokenHash).toHaveBeenCalledWith('mock-hash');
        });
    });

    describe('logoutAll', () => {
        it('should delete all refresh tokens for user', async () => {
            vi.mocked(refreshTokenRepository.deleteByUserId).mockResolvedValue(3);

            await authService.logoutAll(mockUser.id);

            expect(refreshTokenRepository.deleteByUserId).toHaveBeenCalledWith(mockUser.id);
        });
    });
});
