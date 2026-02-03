// apps/web/src/components/spot/__tests__/SpotDetailCard.test.tsx
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SpotDetailCard } from '../SpotDetailCard';
import type { Spot } from '@/stores/spot.types';

const createMockSpot = (overrides: Partial<Spot> = {}): Spot => ({
  id: 'test-spot-123',
  carTagId: null,
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

describe('SpotDetailCard', () => {
  describe('rendering', () => {
    it('should render the spot detail card', () => {
      const spot = createMockSpot();
      render(<SpotDetailCard spot={spot} />);

      expect(screen.getByTestId('spot-detail-card')).toBeInTheDocument();
    });

    it('should display formatted coordinates', () => {
      const spot = createMockSpot({ lat: 40.7128, lng: -74.006 });
      render(<SpotDetailCard spot={spot} />);

      const coordinates = screen.getByTestId('spot-coordinates');
      expect(coordinates).toBeInTheDocument();
      expect(coordinates.textContent).toContain('40.712800');
      expect(coordinates.textContent).toContain('74.006000');
    });

    it('should display accuracy when available', () => {
      const spot = createMockSpot({ accuracyMeters: 15 });
      render(<SpotDetailCard spot={spot} />);

      expect(screen.getByText('±15m accuracy')).toBeInTheDocument();
    });

    it('should display map preview placeholder', () => {
      const spot = createMockSpot();
      render(<SpotDetailCard spot={spot} />);

      expect(screen.getByText('Map Preview')).toBeInTheDocument();
    });
  });

  describe('optional fields', () => {
    it('should display address when provided', () => {
      const spot = createMockSpot({ address: '123 Main St, New York, NY' });
      render(<SpotDetailCard spot={spot} />);

      expect(screen.getByTestId('spot-address')).toBeInTheDocument();
      expect(screen.getByText('123 Main St, New York, NY')).toBeInTheDocument();
    });

    it('should not display address section when not provided', () => {
      const spot = createMockSpot({ address: null });
      render(<SpotDetailCard spot={spot} />);

      expect(screen.queryByTestId('spot-address')).not.toBeInTheDocument();
    });

    it('should display note when provided', () => {
      const spot = createMockSpot({ note: 'Near the red pillar' });
      render(<SpotDetailCard spot={spot} />);

      expect(screen.getByTestId('spot-note')).toBeInTheDocument();
      expect(screen.getByText('Near the red pillar')).toBeInTheDocument();
    });

    it('should not display note section when not provided', () => {
      const spot = createMockSpot({ note: null });
      render(<SpotDetailCard spot={spot} />);

      expect(screen.queryByTestId('spot-note')).not.toBeInTheDocument();
    });

    it('should display floor when provided', () => {
      const spot = createMockSpot({ floor: 'P2' });
      render(<SpotDetailCard spot={spot} />);

      expect(screen.getByText('Floor: P2')).toBeInTheDocument();
    });

    it('should display spot identifier when provided', () => {
      const spot = createMockSpot({ spotIdentifier: 'A-42' });
      render(<SpotDetailCard spot={spot} />);

      expect(screen.getByText('Spot: A-42')).toBeInTheDocument();
    });
  });

  describe('timestamp formatting', () => {
    let originalDateNow: typeof Date.now;

    beforeEach(() => {
      originalDateNow = Date.now;
    });

    afterEach(() => {
      Date.now = originalDateNow;
    });

    it('should show "Just now" for very recent spots', () => {
      const now = new Date();
      const spot = createMockSpot({ savedAt: now.toISOString() });
      render(<SpotDetailCard spot={spot} />);

      expect(screen.getByTestId('spot-relative-time')).toHaveTextContent('Just now');
    });

    it('should show minutes ago for recent spots', () => {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
      const spot = createMockSpot({ savedAt: fiveMinutesAgo.toISOString() });
      render(<SpotDetailCard spot={spot} />);

      expect(screen.getByTestId('spot-relative-time')).toHaveTextContent('5 minutes ago');
    });

    it('should show hours ago for older spots', () => {
      const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
      const spot = createMockSpot({ savedAt: twoHoursAgo.toISOString() });
      render(<SpotDetailCard spot={spot} />);

      expect(screen.getByTestId('spot-relative-time')).toHaveTextContent('2 hours ago');
    });

    it('should display formatted timestamp', () => {
      const spot = createMockSpot();
      render(<SpotDetailCard spot={spot} />);

      expect(screen.getByTestId('spot-timestamp')).toBeInTheDocument();
    });
  });

  describe('coordinate formatting', () => {
    it('should format positive coordinates with N/E directions', () => {
      const spot = createMockSpot({ lat: 40.7128, lng: 74.006 });
      render(<SpotDetailCard spot={spot} />);

      const coordinates = screen.getByTestId('spot-coordinates');
      expect(coordinates.textContent).toContain('N');
      expect(coordinates.textContent).toContain('E');
    });

    it('should format negative coordinates with S/W directions', () => {
      const spot = createMockSpot({ lat: -33.8688, lng: -74.006 });
      render(<SpotDetailCard spot={spot} />);

      const coordinates = screen.getByTestId('spot-coordinates');
      expect(coordinates.textContent).toContain('S');
      expect(coordinates.textContent).toContain('W');
    });
  });
});
