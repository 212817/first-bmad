// apps/web/src/components/spot/__tests__/SpotPhoto.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SpotPhoto } from '../SpotPhoto';

describe('SpotPhoto', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Loading state', () => {
    it('should show loading state initially', () => {
      render(<SpotPhoto url="https://example.com/photo.jpg" />);

      expect(screen.getByTestId('spot-photo-loading')).toBeInTheDocument();
    });
  });

  describe('Successful load', () => {
    it('should hide loading state after image loads', () => {
      render(<SpotPhoto url="https://example.com/photo.jpg" />);

      const img = screen.getByRole('img');
      fireEvent.load(img);

      expect(screen.queryByTestId('spot-photo-loading')).not.toBeInTheDocument();
    });

    it('should show zoom hint after loading', () => {
      render(<SpotPhoto url="https://example.com/photo.jpg" />);

      const img = screen.getByRole('img');
      fireEvent.load(img);

      expect(screen.getByText('Tap to zoom')).toBeInTheDocument();
    });
  });

  describe('Error state', () => {
    it('should show error state on image load failure', () => {
      render(<SpotPhoto url="https://example.com/broken.jpg" />);

      const img = screen.getByRole('img');
      fireEvent.error(img);

      expect(screen.getByTestId('spot-photo-error')).toBeInTheDocument();
      expect(screen.getByText('Photo unavailable')).toBeInTheDocument();
    });
  });

  describe('Tap to zoom', () => {
    it('should call onTap when clicked', () => {
      const onTap = vi.fn();
      render(<SpotPhoto url="https://example.com/photo.jpg" onTap={onTap} />);

      const container = screen.getByTestId('spot-photo');
      fireEvent.click(container);

      expect(onTap).toHaveBeenCalled();
    });

    it('should call onTap on Enter key', () => {
      const onTap = vi.fn();
      render(<SpotPhoto url="https://example.com/photo.jpg" onTap={onTap} />);

      const container = screen.getByTestId('spot-photo');
      fireEvent.keyDown(container, { key: 'Enter' });

      expect(onTap).toHaveBeenCalled();
    });

    it('should call onTap on Space key', () => {
      const onTap = vi.fn();
      render(<SpotPhoto url="https://example.com/photo.jpg" onTap={onTap} />);

      const container = screen.getByTestId('spot-photo');
      fireEvent.keyDown(container, { key: ' ' });

      expect(onTap).toHaveBeenCalled();
    });
  });

  describe('Zoomed state', () => {
    it('should show zoomed overlay when isZoomed is true', () => {
      render(<SpotPhoto url="https://example.com/photo.jpg" isZoomed={true} />);

      expect(screen.getByTestId('spot-photo-zoomed')).toBeInTheDocument();
      expect(screen.getByText('Tap to close')).toBeInTheDocument();
    });

    it('should call onTap when clicking zoomed overlay', () => {
      const onTap = vi.fn();
      render(<SpotPhoto url="https://example.com/photo.jpg" isZoomed={true} onTap={onTap} />);

      const overlay = screen.getByTestId('spot-photo-zoomed');
      fireEvent.click(overlay);

      expect(onTap).toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have accessible button role', () => {
      render(<SpotPhoto url="https://example.com/photo.jpg" />);

      expect(screen.getByRole('button', { name: /Tap to zoom photo/ })).toBeInTheDocument();
    });

    it('should have alt text on image', () => {
      render(<SpotPhoto url="https://example.com/photo.jpg" alt="Test photo" />);

      expect(screen.getByRole('img')).toHaveAttribute('alt', 'Test photo');
    });
  });
});
