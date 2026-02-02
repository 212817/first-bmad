// apps/web/src/components/prompts/__tests__/LocationPermissionPrompt.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LocationPermissionPrompt } from '../LocationPermissionPrompt';

describe('LocationPermissionPrompt', () => {
  const mockOnEnableLocation = vi.fn();
  const mockOnEnterManually = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderPrompt = (props = {}) => {
    return render(
      <LocationPermissionPrompt
        onEnableLocation={mockOnEnableLocation}
        onEnterManually={mockOnEnterManually}
        {...props}
      />
    );
  };

  describe('rendering', () => {
    it('should render the prompt with title', () => {
      renderPrompt();

      expect(screen.getByRole('heading', { name: 'Enable Location' })).toBeInTheDocument();
    });

    it('should render the description text', () => {
      renderPrompt();

      expect(
        screen.getByText(/We need your location to save where you parked/i)
      ).toBeInTheDocument();
    });

    it('should render Enable Location button', () => {
      renderPrompt();

      expect(screen.getByRole('button', { name: /Enable Location/i })).toBeInTheDocument();
    });

    it('should render Enter Address Manually button', () => {
      renderPrompt();

      expect(screen.getByRole('button', { name: /Enter Address Manually/i })).toBeInTheDocument();
    });

    it('should render location icon', () => {
      renderPrompt();

      // Check for SVG presence
      const svg = document.querySelector('svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onEnableLocation when Enable Location clicked', () => {
      renderPrompt();

      fireEvent.click(screen.getByRole('button', { name: /Enable Location/i }));

      expect(mockOnEnableLocation).toHaveBeenCalledTimes(1);
    });

    it('should call onEnterManually when Enter Address Manually clicked', () => {
      renderPrompt();

      fireEvent.click(screen.getByRole('button', { name: /Enter Address Manually/i }));

      expect(mockOnEnterManually).toHaveBeenCalledTimes(1);
    });
  });

  describe('loading state', () => {
    it('should show loading spinner when isLoading is true', () => {
      renderPrompt({ isLoading: true });

      expect(screen.getByText('Getting location...')).toBeInTheDocument();
    });

    it('should disable Enable Location button when loading', () => {
      renderPrompt({ isLoading: true });

      const button = screen.getByRole('button', { name: /Getting location/i });
      expect(button).toBeDisabled();
    });

    it('should disable Enter Manually button when loading', () => {
      renderPrompt({ isLoading: true });

      const button = screen.getByRole('button', { name: /Enter Address Manually/i });
      expect(button).toBeDisabled();
    });

    it('should show Enable Location text when not loading', () => {
      renderPrompt({ isLoading: false });

      expect(screen.getByRole('button', { name: /Enable Location/i })).toBeInTheDocument();
    });
  });

  describe('accessibility', () => {
    it('should have overlay with proper background', () => {
      renderPrompt();

      const overlay = document.querySelector('.fixed.inset-0');
      expect(overlay).toBeInTheDocument();
      expect(overlay).toHaveClass('bg-black/50');
    });

    it('should have modal dialog styling', () => {
      renderPrompt();

      const modal = document.querySelector('.bg-white.rounded-xl');
      expect(modal).toBeInTheDocument();
    });
  });
});
