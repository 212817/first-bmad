// apps/web/src/components/ui/__tests__/GuestModeBanner.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { GuestModeBanner } from '../GuestModeBanner';

describe('GuestModeBanner', () => {
  const originalLocation = window.location;

  beforeEach(() => {
    // Mock window.location
    Object.defineProperty(window, 'location', {
      value: { href: '' },
      writable: true,
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      value: originalLocation,
      writable: true,
    });
  });

  describe('rendering', () => {
    it('should render the guest mode message', () => {
      render(<GuestModeBanner />);

      expect(screen.getByText('Guest Mode - Data stored locally only')).toBeInTheDocument();
    });

    it('should render the sign in link', () => {
      render(<GuestModeBanner />);

      expect(screen.getByRole('button', { name: /sign in to sync/i })).toBeInTheDocument();
    });

    it('should have sticky positioning', () => {
      const { container } = render(<GuestModeBanner />);
      const banner = container.firstChild;

      expect(banner).toHaveClass('sticky', 'top-0');
    });
  });

  describe('sign in button', () => {
    it('should call onSignInClick when provided', () => {
      const onSignInClick = vi.fn();
      render(<GuestModeBanner onSignInClick={onSignInClick} />);

      const button = screen.getByRole('button', { name: /sign in to sync/i });
      fireEvent.click(button);

      expect(onSignInClick).toHaveBeenCalledTimes(1);
    });

    it('should redirect to /login when onSignInClick is not provided', () => {
      render(<GuestModeBanner />);

      const button = screen.getByRole('button', { name: /sign in to sync/i });
      fireEvent.click(button);

      expect(window.location.href).toBe('/login');
    });
  });
});
