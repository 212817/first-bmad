// apps/web/src/components/timer/__tests__/MeterTimerDisplay.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { MeterTimerDisplay } from '../MeterTimerDisplay';

describe('MeterTimerDisplay', () => {
  const fixedNow = new Date('2026-02-06T12:00:00Z').getTime();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(fixedNow);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('time formatting', () => {
    it('should display hours and minutes when > 1 hour remaining', () => {
      const expiresAt = new Date(fixedNow + 90 * 60 * 1000).toISOString(); // 1h 30m
      render(<MeterTimerDisplay expiresAt={expiresAt} />);

      expect(screen.getByTestId('timer-text')).toHaveTextContent('1h 30m 0s');
    });

    it('should display only minutes when < 1 hour remaining', () => {
      const expiresAt = new Date(fixedNow + 45 * 60 * 1000).toISOString(); // 45m
      render(<MeterTimerDisplay expiresAt={expiresAt} />);

      expect(screen.getByTestId('timer-text')).toHaveTextContent('45m 0s');
    });

    it('should display "Expired" when past due', () => {
      const expiresAt = new Date(fixedNow - 5 * 60 * 1000).toISOString(); // 5m ago
      render(<MeterTimerDisplay expiresAt={expiresAt} />);

      expect(screen.getByTestId('timer-text')).toHaveTextContent('Expired');
    });
  });

  describe('color coding', () => {
    it('should have green styling when > 30 minutes remaining', () => {
      const expiresAt = new Date(fixedNow + 60 * 60 * 1000).toISOString(); // 60m
      render(<MeterTimerDisplay expiresAt={expiresAt} />);

      const display = screen.getByTestId('meter-timer-display');
      expect(display).toHaveClass('text-green-600');
      expect(display).toHaveClass('bg-green-50');
    });

    it('should have yellow styling when 10-30 minutes remaining', () => {
      const expiresAt = new Date(fixedNow + 20 * 60 * 1000).toISOString(); // 20m
      render(<MeterTimerDisplay expiresAt={expiresAt} />);

      const display = screen.getByTestId('meter-timer-display');
      expect(display).toHaveClass('text-yellow-600');
      expect(display).toHaveClass('bg-yellow-50');
    });

    it('should have red styling when < 10 minutes remaining', () => {
      const expiresAt = new Date(fixedNow + 5 * 60 * 1000).toISOString(); // 5m
      render(<MeterTimerDisplay expiresAt={expiresAt} />);

      const display = screen.getByTestId('meter-timer-display');
      expect(display).toHaveClass('text-red-600');
      expect(display).toHaveClass('bg-red-50');
    });

    it('should have red styling when expired', () => {
      const expiresAt = new Date(fixedNow - 5 * 60 * 1000).toISOString(); // -5m
      render(<MeterTimerDisplay expiresAt={expiresAt} />);

      const display = screen.getByTestId('meter-timer-display');
      expect(display).toHaveClass('text-red-600');
      expect(display).toHaveClass('bg-red-50');
    });
  });

  describe('size variants', () => {
    it('should apply small size styling', () => {
      const expiresAt = new Date(fixedNow + 60 * 60 * 1000).toISOString();
      render(<MeterTimerDisplay expiresAt={expiresAt} size="sm" />);

      const display = screen.getByTestId('meter-timer-display');
      expect(display).toHaveClass('text-xs');
    });

    it('should apply medium size styling by default', () => {
      const expiresAt = new Date(fixedNow + 60 * 60 * 1000).toISOString();
      render(<MeterTimerDisplay expiresAt={expiresAt} />);

      const display = screen.getByTestId('meter-timer-display');
      expect(display).toHaveClass('text-sm');
    });

    it('should apply large size styling', () => {
      const expiresAt = new Date(fixedNow + 60 * 60 * 1000).toISOString();
      render(<MeterTimerDisplay expiresAt={expiresAt} size="lg" />);

      const display = screen.getByTestId('meter-timer-display');
      expect(display).toHaveClass('text-base');
    });
  });

  describe('timer updates', () => {
    it('should update display after one second', () => {
      const expiresAt = new Date(fixedNow + 45 * 60 * 1000).toISOString(); // 45m
      render(<MeterTimerDisplay expiresAt={expiresAt} />);

      expect(screen.getByTestId('timer-text')).toHaveTextContent('45m 0s');

      // Advance time by 1 second
      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(screen.getByTestId('timer-text')).toHaveTextContent('44m 59s');
    });

    it('should transition to expired state', () => {
      const expiresAt = new Date(fixedNow + 1 * 60 * 1000).toISOString(); // 1m
      render(<MeterTimerDisplay expiresAt={expiresAt} />);

      expect(screen.getByTestId('timer-text')).toHaveTextContent('1m 0s');

      // Advance time by 2 minutes
      act(() => {
        vi.advanceTimersByTime(2 * 60000);
      });

      expect(screen.getByTestId('timer-text')).toHaveTextContent('Expired');
    });
  });

  describe('accessibility', () => {
    it('should have aria-label with time remaining', () => {
      const expiresAt = new Date(fixedNow + 90 * 60 * 1000).toISOString();
      render(<MeterTimerDisplay expiresAt={expiresAt} />);

      const display = screen.getByTestId('meter-timer-display');
      expect(display).toHaveAttribute('aria-label', '1h 30m 0s remaining');
    });

    it('should have aria-label for expired state', () => {
      const expiresAt = new Date(fixedNow - 5 * 60 * 1000).toISOString();
      render(<MeterTimerDisplay expiresAt={expiresAt} />);

      const display = screen.getByTestId('meter-timer-display');
      expect(display).toHaveAttribute('aria-label', 'Meter expired');
    });
  });
});
