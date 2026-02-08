// apps/web/src/components/spot/__tests__/LatestSpotCard.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { LatestSpotCard } from '../LatestSpotCard';
import type { Spot } from '@/stores/spot.types';

describe('LatestSpotCard', () => {
  const mockSpot: Spot = {
    id: 'spot-123',
    carTagId: 'tag-1',
    lat: 40.7128,
    lng: -74.006,
    accuracyMeters: 10,
    address: 'Near Central Park West, New York',
    photoUrl: 'https://example.com/photo.jpg',
    note: 'Level P2',
    floor: null,
    spotIdentifier: null,
    meterExpiresAt: null,
    isActive: true,
    savedAt: '2026-02-03T10:00:00Z',
  };

  const mockOnNavigate = vi.fn();

  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-02-03T12:00:00Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  describe('with spot data', () => {
    it('should render the card with spot data', () => {
      render(<LatestSpotCard spot={mockSpot} onNavigate={mockOnNavigate} />);

      expect(screen.getByTestId('latest-spot-card')).toBeInTheDocument();
    });

    it('should display the address', () => {
      render(<LatestSpotCard spot={mockSpot} onNavigate={mockOnNavigate} />);

      expect(screen.getByTestId('spot-location')).toHaveTextContent(
        'Near Central Park West, New York'
      );
    });

    it('should display relative timestamp', () => {
      render(<LatestSpotCard spot={mockSpot} onNavigate={mockOnNavigate} />);

      expect(screen.getByTestId('spot-timestamp')).toHaveTextContent('2h ago');
    });

    it('should display car tag badge', () => {
      render(
        <LatestSpotCard
          spot={mockSpot}
          carTagName="My Car"
          carTagColor="#3B82F6"
          onNavigate={mockOnNavigate}
        />
      );

      expect(screen.getByTestId('tag-badge')).toBeInTheDocument();
      expect(screen.getByText('My Car')).toBeInTheDocument();
    });

    it('should display default tag when no tag provided', () => {
      render(<LatestSpotCard spot={mockSpot} onNavigate={mockOnNavigate} />);

      expect(screen.getByText('My Car')).toBeInTheDocument();
    });

    it('should display photo thumbnail when photoUrl exists', () => {
      render(<LatestSpotCard spot={mockSpot} onNavigate={mockOnNavigate} />);

      expect(screen.getByTestId('spot-thumbnail')).toBeInTheDocument();
    });

    it('should not display photo thumbnail when no photoUrl', () => {
      const spotWithoutPhoto = { ...mockSpot, photoUrl: null };
      render(<LatestSpotCard spot={spotWithoutPhoto} onNavigate={mockOnNavigate} />);

      expect(screen.queryByTestId('spot-thumbnail')).not.toBeInTheDocument();
    });

    it('should display note when available', () => {
      render(<LatestSpotCard spot={mockSpot} onNavigate={mockOnNavigate} />);

      expect(screen.getByTestId('spot-note')).toHaveTextContent('Level P2');
    });

    it('should not display note when not available', () => {
      const spotWithoutNote = { ...mockSpot, note: null };
      render(<LatestSpotCard spot={spotWithoutNote} onNavigate={mockOnNavigate} />);

      expect(screen.queryByTestId('spot-note')).not.toBeInTheDocument();
    });

    it('should display Navigate button', () => {
      render(<LatestSpotCard spot={mockSpot} onNavigate={mockOnNavigate} />);

      expect(screen.getByTestId('navigate-button')).toBeInTheDocument();
      expect(screen.getByText('Navigate')).toBeInTheDocument();
    });

    it('should call onNavigate when Navigate button is clicked', () => {
      render(<LatestSpotCard spot={mockSpot} onNavigate={mockOnNavigate} />);

      fireEvent.click(screen.getByTestId('navigate-button'));

      expect(mockOnNavigate).toHaveBeenCalledTimes(1);
    });
  });

  describe('with coordinates only', () => {
    it('should display Address unavailable when no address', () => {
      const spotWithCoords = { ...mockSpot, address: null };
      render(<LatestSpotCard spot={spotWithCoords} onNavigate={mockOnNavigate} />);

      expect(screen.getByTestId('spot-location')).toHaveTextContent('Address unavailable');
    });
  });

  describe('empty state', () => {
    it('should show empty state when spot is null', () => {
      render(<LatestSpotCard spot={null} onNavigate={mockOnNavigate} />);

      expect(screen.getByTestId('empty-spot-state')).toBeInTheDocument();
      expect(screen.queryByTestId('latest-spot-card')).not.toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('should show loading skeleton when isLoading is true', () => {
      render(<LatestSpotCard spot={mockSpot} onNavigate={mockOnNavigate} isLoading />);

      expect(screen.getByTestId('latest-spot-card-loading')).toBeInTheDocument();
      expect(screen.queryByTestId('latest-spot-card')).not.toBeInTheDocument();
    });
  });

  describe('meter timer display', () => {
    it('should display meter timer when meterExpiresAt is set', () => {
      const futureTime = new Date(Date.now() + 60 * 60 * 1000).toISOString(); // 1 hour from now
      const spotWithTimer = { ...mockSpot, meterExpiresAt: futureTime };
      render(<LatestSpotCard spot={spotWithTimer} onNavigate={mockOnNavigate} />);

      expect(screen.getByTestId('meter-timer-display')).toBeInTheDocument();
    });

    it('should not display meter timer when meterExpiresAt is null', () => {
      render(<LatestSpotCard spot={mockSpot} onNavigate={mockOnNavigate} />);

      expect(screen.queryByTestId('meter-timer-display')).not.toBeInTheDocument();
    });
  });
});
