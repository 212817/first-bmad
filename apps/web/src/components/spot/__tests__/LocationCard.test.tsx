// apps/web/src/components/spot/__tests__/LocationCard.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { LocationCard } from '../LocationCard';

// Mock navigator.clipboard
const mockWriteText = vi.fn();
Object.assign(navigator, {
  clipboard: {
    writeText: mockWriteText,
  },
});

describe('LocationCard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWriteText.mockResolvedValue(undefined);
  });

  describe('Address display', () => {
    it('should show address when provided', () => {
      render(<LocationCard address="123 Main St" lat={40.7128} lng={-74.006} />);

      expect(screen.getByTestId('location-address')).toHaveTextContent('123 Main St');
    });

    it('should show "Address unavailable" when no address', () => {
      render(<LocationCard address={null} lat={40.7128} lng={-74.006} />);

      expect(screen.getByTestId('location-address')).toHaveTextContent('Address unavailable');
    });

    it('should show coordinates below address', () => {
      render(<LocationCard address="123 Main St" lat={40.7128} lng={-74.006} />);

      expect(screen.getByTestId('location-coordinates')).toBeInTheDocument();
    });
  });

  describe('Coordinates display', () => {
    it('should format coordinates correctly', () => {
      render(<LocationCard address={null} lat={40.7128} lng={-74.006} />);

      expect(screen.getByTestId('location-coordinates')).toHaveTextContent('40.7128°N');
    });

    it('should not show coordinates when not available', () => {
      render(<LocationCard address="123 Main St" lat={null} lng={null} />);

      expect(screen.queryByTestId('location-coordinates')).not.toBeInTheDocument();
    });
  });

  describe('Copy coordinates', () => {
    it('should copy coordinates to clipboard when clicked', async () => {
      render(<LocationCard address="123 Main St" lat={40.7128} lng={-74.006} />);

      fireEvent.click(screen.getByTestId('location-coordinates'));

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith('40.712800, -74.006000');
      });
    });
  });

  describe('Tag display', () => {
    it('should show tag when provided', () => {
      render(
        <LocationCard
          address="123 Main St"
          lat={40.7128}
          lng={-74.006}
          tagName="My Car"
          tagColor="#3B82F6"
        />
      );

      expect(screen.getByTestId('tag-badge')).toHaveTextContent('My Car');
    });

    it('should not show tag when not provided', () => {
      render(<LocationCard address="123 Main St" lat={40.7128} lng={-74.006} />);

      expect(screen.queryByTestId('tag-badge')).not.toBeInTheDocument();
    });
  });
});
