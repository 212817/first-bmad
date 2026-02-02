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

    it('should render Photo action button', () => {
      const spot = createMockSpot();
      render(<SpotActions spot={spot} />);

      expect(screen.getByTestId('action-button-photo')).toBeInTheDocument();
    });

    it('should render Note action button', () => {
      const spot = createMockSpot();
      render(<SpotActions spot={spot} />);

      expect(screen.getByTestId('action-button-note')).toBeInTheDocument();
    });

    it('should render Tag action button', () => {
      const spot = createMockSpot();
      render(<SpotActions spot={spot} />);

      expect(screen.getByTestId('action-button-tag')).toBeInTheDocument();
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
    it('should show Photo button as active when photoUrl exists', () => {
      const spot = createMockSpot({ photoUrl: 'https://example.com/photo.jpg' });
      render(<SpotActions spot={spot} />);

      const photoButton = screen.getByTestId('action-button-photo ✓');
      expect(photoButton).toBeInTheDocument();
    });

    it('should show Note button as active when note exists', () => {
      const spot = createMockSpot({ note: 'Test note' });
      render(<SpotActions spot={spot} />);

      const noteButton = screen.getByTestId('action-button-note ✓');
      expect(noteButton).toBeInTheDocument();
    });

    it('should show Photo button without checkmark when no photo', () => {
      const spot = createMockSpot({ photoUrl: null });
      render(<SpotActions spot={spot} />);

      expect(screen.getByTestId('action-button-photo')).toBeInTheDocument();
      expect(screen.queryByTestId('action-button-photo ✓')).not.toBeInTheDocument();
    });
  });

  describe('click handlers', () => {
    it('should call onPhotoClick when Photo button is clicked', () => {
      const onPhotoClick = vi.fn();
      const spot = createMockSpot();
      render(<SpotActions spot={spot} onPhotoClick={onPhotoClick} />);

      fireEvent.click(screen.getByTestId('action-button-photo'));
      expect(onPhotoClick).toHaveBeenCalledTimes(1);
    });

    it('should call onNoteClick when Note button is clicked', () => {
      const onNoteClick = vi.fn();
      const spot = createMockSpot();
      render(<SpotActions spot={spot} onNoteClick={onNoteClick} />);

      fireEvent.click(screen.getByTestId('action-button-note'));
      expect(onNoteClick).toHaveBeenCalledTimes(1);
    });

    it('should call onTagClick when Tag button is clicked', () => {
      const onTagClick = vi.fn();
      const spot = createMockSpot();
      render(<SpotActions spot={spot} onTagClick={onTagClick} />);

      fireEvent.click(screen.getByTestId('action-button-tag'));
      expect(onTagClick).toHaveBeenCalledTimes(1);
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
    it('should display "Photo" label on Photo button', () => {
      const spot = createMockSpot();
      render(<SpotActions spot={spot} />);

      expect(screen.getByText('Photo')).toBeInTheDocument();
    });

    it('should display "Note" label on Note button', () => {
      const spot = createMockSpot();
      render(<SpotActions spot={spot} />);

      expect(screen.getByText('Note')).toBeInTheDocument();
    });

    it('should display "Tag" label on Tag button', () => {
      const spot = createMockSpot();
      render(<SpotActions spot={spot} />);

      expect(screen.getByText('Tag')).toBeInTheDocument();
    });

    it('should display "Timer" label on Timer button', () => {
      const spot = createMockSpot();
      render(<SpotActions spot={spot} />);

      expect(screen.getByText('Timer')).toBeInTheDocument();
    });
  });

  describe('icons', () => {
    it('should display camera emoji for Photo button', () => {
      const spot = createMockSpot();
      render(<SpotActions spot={spot} />);

      expect(screen.getByText('📷')).toBeInTheDocument();
    });

    it('should display note emoji for Note button', () => {
      const spot = createMockSpot();
      render(<SpotActions spot={spot} />);

      expect(screen.getByText('📝')).toBeInTheDocument();
    });

    it('should display car emoji for Tag button', () => {
      const spot = createMockSpot();
      render(<SpotActions spot={spot} />);

      expect(screen.getByText('🚗')).toBeInTheDocument();
    });

    it('should display timer emoji for Timer button', () => {
      const spot = createMockSpot();
      render(<SpotActions spot={spot} />);

      expect(screen.getByText('⏱️')).toBeInTheDocument();
    });
  });
});
