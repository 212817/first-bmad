// apps/api/test/unit/jwt.service.test.ts
import { describe, it, expect } from 'vitest';
import { jwtService } from '../../src/services/jwt/jwt.service.js';

describe('JWT Service', () => {
  const testUserId = '123e4567-e89b-12d3-a456-426614174000';
  const testEmail = 'test@example.com';

  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const token = jwtService.generateAccessToken(testUserId, testEmail);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT format
    });

    it('should generate tokens that can be verified', () => {
      const token = jwtService.generateAccessToken(testUserId, testEmail);
      const payload = jwtService.verifyAccessToken(token);

      expect(payload).not.toBeNull();
      expect(payload?.sub).toBe(testUserId);
      expect(payload?.email).toBe(testEmail);
      expect(payload?.type).toBe('access');
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const token = jwtService.generateRefreshToken(testUserId);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT format
    });

    it('should generate tokens that can be verified', () => {
      const token = jwtService.generateRefreshToken(testUserId);
      const payload = jwtService.verifyRefreshToken(token);

      expect(payload).not.toBeNull();
      expect(payload?.sub).toBe(testUserId);
      expect(payload?.type).toBe('refresh');
    });
  });

  describe('verifyAccessToken', () => {
    it('should return null for invalid token', () => {
      const payload = jwtService.verifyAccessToken('invalid-token');
      expect(payload).toBeNull();
    });

    it('should return null for refresh token used as access token', () => {
      const refreshToken = jwtService.generateRefreshToken(testUserId);
      const payload = jwtService.verifyAccessToken(refreshToken);
      expect(payload).toBeNull();
    });
  });

  describe('verifyRefreshToken', () => {
    it('should return null for invalid token', () => {
      const payload = jwtService.verifyRefreshToken('invalid-token');
      expect(payload).toBeNull();
    });

    it('should return null for access token used as refresh token', () => {
      const accessToken = jwtService.generateAccessToken(testUserId, testEmail);
      const payload = jwtService.verifyRefreshToken(accessToken);
      expect(payload).toBeNull();
    });
  });

  describe('hashToken', () => {
    it('should generate consistent hash for same token', () => {
      const token = 'test-token-string';
      const hash1 = jwtService.hashToken(token);
      const hash2 = jwtService.hashToken(token);

      expect(hash1).toBe(hash2);
    });

    it('should generate 64-character hex hash', () => {
      const token = 'test-token-string';
      const hash = jwtService.hashToken(token);

      expect(hash).toHaveLength(64);
      expect(/^[a-f0-9]+$/.test(hash)).toBe(true);
    });

    it('should generate different hashes for different tokens', () => {
      const hash1 = jwtService.hashToken('token1');
      const hash2 = jwtService.hashToken('token2');

      expect(hash1).not.toBe(hash2);
    });
  });
});
