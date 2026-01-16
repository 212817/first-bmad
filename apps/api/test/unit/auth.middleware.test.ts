// apps/api/test/unit/auth.middleware.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Request, Response, NextFunction } from 'express';
import { authMiddleware } from '../../src/middleware/auth.middleware.js';
import { jwtService } from '../../src/services/jwt/jwt.service.js';
import { AuthenticationError } from '@repo/shared/errors';

// Mock jwtService
vi.mock('../../src/services/jwt/jwt.service.js');

describe('AuthMiddleware', () => {
    let mockRequest: Partial<Request>;
    let mockResponse: Partial<Response>;
    let mockNext: NextFunction;

    beforeEach(() => {
        vi.clearAllMocks();

        mockRequest = {
            headers: {},
            cookies: {},
        };
        mockResponse = {};
        mockNext = vi.fn();
    });

    describe('token extraction', () => {
        it('should extract token from Authorization header', () => {
            const mockPayload = { sub: 'user-123', email: 'test@example.com', type: 'access' };
            vi.mocked(jwtService.verifyAccessToken).mockReturnValue(mockPayload as any);

            mockRequest.headers = { authorization: 'Bearer valid-token' };

            authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

            expect(jwtService.verifyAccessToken).toHaveBeenCalledWith('valid-token');
            expect(mockRequest.user).toEqual({ id: 'user-123', email: 'test@example.com' });
            expect(mockNext).toHaveBeenCalled();
        });

        it('should extract token from cookie when no header', () => {
            const mockPayload = { sub: 'user-123', email: 'test@example.com', type: 'access' };
            vi.mocked(jwtService.verifyAccessToken).mockReturnValue(mockPayload as any);

            mockRequest.cookies = { accessToken: 'cookie-token' };

            authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

            expect(jwtService.verifyAccessToken).toHaveBeenCalledWith('cookie-token');
            expect(mockRequest.user).toEqual({ id: 'user-123', email: 'test@example.com' });
            expect(mockNext).toHaveBeenCalled();
        });

        it('should prefer Authorization header over cookie', () => {
            const mockPayload = { sub: 'user-123', email: 'test@example.com', type: 'access' };
            vi.mocked(jwtService.verifyAccessToken).mockReturnValue(mockPayload as any);

            mockRequest.headers = { authorization: 'Bearer header-token' };
            mockRequest.cookies = { accessToken: 'cookie-token' };

            authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

            expect(jwtService.verifyAccessToken).toHaveBeenCalledWith('header-token');
        });
    });

    describe('error handling', () => {
        it('should throw AuthenticationError when no token provided', () => {
            mockRequest.headers = {};
            mockRequest.cookies = {};

            expect(() => {
                authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
            }).toThrow(AuthenticationError);
        });

        it('should throw AuthenticationError when Authorization header has wrong format', () => {
            mockRequest.headers = { authorization: 'InvalidFormat token' };
            mockRequest.cookies = {};

            expect(() => {
                authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
            }).toThrow(AuthenticationError);
        });

        it('should throw AuthenticationError when token is invalid', () => {
            vi.mocked(jwtService.verifyAccessToken).mockReturnValue(null);

            mockRequest.headers = { authorization: 'Bearer invalid-token' };

            expect(() => {
                authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
            }).toThrow(AuthenticationError);
        });

        it('should throw AuthenticationError when token is expired', () => {
            vi.mocked(jwtService.verifyAccessToken).mockReturnValue(null);

            mockRequest.headers = { authorization: 'Bearer expired-token' };

            expect(() => {
                authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);
            }).toThrow(AuthenticationError);
        });
    });

    describe('user attachment', () => {
        it('should attach user with correct properties to request', () => {
            const mockPayload = {
                sub: 'user-uuid-123',
                email: 'user@example.com',
                type: 'access',
                iat: 1234567890,
                exp: 1234567890,
            };
            vi.mocked(jwtService.verifyAccessToken).mockReturnValue(mockPayload as any);

            mockRequest.headers = { authorization: 'Bearer valid-token' };

            authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockRequest.user).toEqual({
                id: 'user-uuid-123',
                email: 'user@example.com',
            });
        });

        it('should call next() after successful authentication', () => {
            const mockPayload = { sub: 'user-123', email: 'test@example.com', type: 'access' };
            vi.mocked(jwtService.verifyAccessToken).mockReturnValue(mockPayload as any);

            mockRequest.headers = { authorization: 'Bearer valid-token' };

            authMiddleware(mockRequest as Request, mockResponse as Response, mockNext);

            expect(mockNext).toHaveBeenCalledTimes(1);
            expect(mockNext).toHaveBeenCalledWith();
        });
    });
});
