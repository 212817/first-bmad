// apps/web/src/components/spot/__tests__/SpotActions.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SpotActions } from '../SpotActions';
import type { Spot } from '@/stores/spot.types';

const createMockSpot = (overrides: Partial<Spot> = {}): Spot => ({
  id: 'test-spot-123',
  lat: 40.7128,
  lng: -74.006,
  accuracyMeters: 10,
  address: null,
  photoUrl: null,
  note: null,
  floor: null,
  spotIdentifier: null,
  isActive: true,
  savedAt: new Date().toISOString(),
  ...overrides,
});

describe('SpotActions', () => {
  describe('rendering', () => {
    it('should render the actions container', () => {
      const spot = createMockSpot();
      render(<SpotActions spot={spot} />);

      expect(screen.getByTestId('spot-actions')).toBeInTheDocument();
    });

    it('should render Camera action button', () => {
      const spot = createMockSpot();
      render(<SpotActions spot={spot} />);

      expect(screen.getByTestId('action-button-camera')).toBeInTheDocument();
    });

    it('should render Gallery action button', () => {
      const spot = createMockSpot();
      render(<SpotActions spot={spot} />);

      expect(screen.getByTestId('action-button-gallery')).toBeInTheDocument();
    });

    it('should render Timer action button as disabled', () => {
      const spot = createMockSpot();
      render(<SpotActions spot={spot} />);

      const timerButton = screen.getByTestId('action-button-timer');
      expect(timerButton).toBeInTheDocument();
      expect(timerButton).toBeDisabled();
    });
  });

  describe('active states', () => {
    it('should show Photo ✓ button as active when photoUrl exists', () => {
      const spot = createMockSpot({ photoUrl: 'https://example.com/photo.jpg' });
      render(<SpotActions spot={spot} />);

      const photoButton = screen.getByTestId('action-button-photo-✓');
      expect(photoButton).toBeInTheDocument();
    });

    it('should show Camera button without checkmark when no photo', () => {
      const spot = createMockSpot({ photoUrl: null });
      render(<SpotActions spot={spot} />);

      expect(screen.getByTestId('action-button-camera')).toBeInTheDocument();
      expect(screen.queryByTestId('action-button-photo-✓')).not.toBeInTheDocument();
    });
  });

  describe('click handlers', () => {
    it('should call onPhotoClick when Camera button is clicked', () => {
      const onPhotoClick = vi.fn();
      const spot = createMockSpot();
      render(<SpotActions spot={spot} onPhotoClick={onPhotoClick} />);

      fireEvent.click(screen.getByTestId('action-button-camera'));
      expect(onPhotoClick).toHaveBeenCalledTimes(1);
    });

    it('should call onGalleryClick when Gallery button is clicked', () => {
      const onGalleryClick = vi.fn();
      const spot = createMockSpot();
      render(<SpotActions spot={spot} onGalleryClick={onGalleryClick} />);

      fireEvent.click(screen.getByTestId('action-button-gallery'));
      expect(onGalleryClick).toHaveBeenCalledTimes(1);
    });

    it('should not call onTimerClick when Timer button is clicked (disabled)', () => {
      const onTimerClick = vi.fn();
      const spot = createMockSpot();
      render(<SpotActions spot={spot} onTimerClick={onTimerClick} />);

      const timerButton = screen.getByTestId('action-button-timer');
      fireEvent.click(timerButton);
      expect(onTimerClick).not.toHaveBeenCalled();
    });
  });

  describe('button labels', () => {
    it('should display "Camera" label on Camera button', () => {
      const spot = createMockSpot();
      render(<SpotActions spot={spot} />);

      expect(screen.getByText('Camera')).toBeInTheDocument();
    });

    it('should display "Gallery" label on Gallery button', () => {
      const spot = createMockSpot();
      render(<SpotActions spot={spot} />);

      expect(screen.getByText('Gallery')).toBeInTheDocument();
    });

    it('should display "Timer" label on Timer button', () => {
      const spot = createMockSpot();
      render(<SpotActions spot={spot} />);

      expect(screen.getByText('Timer')).toBeInTheDocument();
    });
  });

  describe('icons', () => {
    it('should display camera emoji for Camera button', () => {
      const spot = createMockSpot();
      render(<SpotActions spot={spot} />);

      expect(screen.getByText('📷')).toBeInTheDocument();
    });

    it('should display gallery emoji for Gallery button', () => {
      const spot = createMockSpot();
      render(<SpotActions spot={spot} />);

      expect(screen.getByText('🖼️')).toBeInTheDocument();
    });

    it('should display timer emoji for Timer button', () => {
      const spot = createMockSpot();
      render(<SpotActions spot={spot} />);

      expect(screen.getByText('⏱️')).toBeInTheDocument();
    });
  });
});
