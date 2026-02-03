// apps/web/src/utils/__tests__/formatters.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { formatRelativeTime, formatCoordinates } from '../formatters';

describe('formatters', () => {
  describe('formatRelativeTime', () => {
    beforeEach(() => {
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2026-02-03T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('should return "just now" for times less than a minute ago', () => {
      const date = new Date('2026-02-03T11:59:30Z');
      expect(formatRelativeTime(date)).toBe('just now');
    });

    it('should return minutes ago for times less than an hour ago', () => {
      const date = new Date('2026-02-03T11:30:00Z');
      expect(formatRelativeTime(date)).toBe('30m ago');
    });

    it('should return hours ago for times less than a day ago', () => {
      const date = new Date('2026-02-03T09:00:00Z');
      expect(formatRelativeTime(date)).toBe('3h ago');
    });

    it('should return days ago for times less than a week ago', () => {
      const date = new Date('2026-02-01T12:00:00Z');
      expect(formatRelativeTime(date)).toBe('2d ago');
    });

    it('should return weeks ago for times less than a month ago', () => {
      const date = new Date('2026-01-15T12:00:00Z');
      expect(formatRelativeTime(date)).toBe('2w ago');
    });

    it('should return months ago for times less than a year ago', () => {
      const date = new Date('2025-11-03T12:00:00Z');
      expect(formatRelativeTime(date)).toBe('3mo ago');
    });

    it('should return years ago for times more than a year ago', () => {
      const date = new Date('2024-02-03T12:00:00Z');
      expect(formatRelativeTime(date)).toBe('2y ago');
    });

    it('should handle string dates', () => {
      expect(formatRelativeTime('2026-02-03T11:00:00Z')).toBe('1h ago');
    });
  });

  describe('formatCoordinates', () => {
    it('should format positive coordinates correctly', () => {
      expect(formatCoordinates(40.7128, 74.006)).toBe('40.7128°N, 74.0060°E');
    });

    it('should format negative lat as South', () => {
      expect(formatCoordinates(-33.8688, 151.2093)).toBe('33.8688°S, 151.2093°E');
    });

    it('should format negative lng as West', () => {
      expect(formatCoordinates(40.7128, -74.006)).toBe('40.7128°N, 74.0060°W');
    });

    it('should format zero coordinates correctly', () => {
      expect(formatCoordinates(0, 0)).toBe('0.0000°N, 0.0000°E');
    });
  });
});
