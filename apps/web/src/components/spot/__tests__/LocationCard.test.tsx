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

    it('should show coordinates below address', () => {
      render(<LocationCard address="123 Main St" lat={40.7128} lng={-74.006} />);

      expect(screen.getByTestId('location-coordinates')).toBeInTheDocument();
    });
  });

  describe('Coordinates only display', () => {
    it('should show coordinates when no address', () => {
      render(<LocationCard address={null} lat={40.7128} lng={-74.006} />);

      expect(screen.getByTestId('location-coordinates-only')).toBeInTheDocument();
      expect(screen.getByTestId('location-coordinates-only')).toHaveTextContent(
        '40.712800, -74.006000'
      );
    });
  });

  describe('No location display', () => {
    it('should show unavailable message when no address or coordinates', () => {
      render(<LocationCard address={null} lat={null} lng={null} />);

      expect(screen.getByTestId('location-unavailable')).toHaveTextContent(
        'Location not available'
      );
    });
  });

  describe('Copy to clipboard', () => {
    it('should copy address to clipboard when clicked', async () => {
      render(<LocationCard address="123 Main St" lat={40.7128} lng={-74.006} />);

      fireEvent.click(screen.getByTestId('location-card'));

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith('123 Main St');
      });
    });

    it('should copy coordinates when no address', async () => {
      render(<LocationCard address={null} lat={40.7128} lng={-74.006} />);

      fireEvent.click(screen.getByTestId('location-card'));

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith('40.712800, -74.006000');
      });
    });

    it('should show "Copied!" feedback after copying', async () => {
      render(<LocationCard address="123 Main St" lat={40.7128} lng={-74.006} />);

      expect(screen.getByTestId('copy-hint')).toHaveTextContent('Tap to copy');

      fireEvent.click(screen.getByTestId('location-card'));

      await waitFor(() => {
        expect(screen.getByTestId('copy-hint')).toHaveTextContent('Copied!');
      });
    });

    it('should initially show tap to copy hint', () => {
      render(<LocationCard address="123 Main St" lat={40.7128} lng={-74.006} />);

      expect(screen.getByTestId('copy-hint')).toHaveTextContent('Tap to copy');
    });

    it('should handle clipboard API failure gracefully', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      mockWriteText.mockRejectedValue(new Error('Clipboard not available'));

      render(<LocationCard address="123 Main St" lat={40.7128} lng={-74.006} />);

      fireEvent.click(screen.getByTestId('location-card'));

      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Failed to copy to clipboard');
      });

      // Should not show "Copied!" on failure
      expect(screen.getByTestId('copy-hint')).toHaveTextContent('Tap to copy');

      consoleSpy.mockRestore();
    });

    it('should copy "Location not available" when no address or coordinates', async () => {
      render(<LocationCard address={null} lat={null} lng={null} />);

      fireEvent.click(screen.getByTestId('location-card'));

      await waitFor(() => {
        expect(mockWriteText).toHaveBeenCalledWith('Location not available');
      });
    });
  });

  describe('Accessibility', () => {
    it('should have accessible label', () => {
      render(<LocationCard address="123 Main St" lat={40.7128} lng={-74.006} />);

      expect(screen.getByLabelText(/Copy.*to clipboard/)).toBeInTheDocument();
    });
  });
});
