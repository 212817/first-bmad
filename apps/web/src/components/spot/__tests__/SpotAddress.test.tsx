// apps/web/src/components/spot/__tests__/SpotAddress.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SpotAddress } from '../SpotAddress';

describe('SpotAddress', () => {
  describe('with address', () => {
    it('should display address with "Near" prefix', () => {
      render(<SpotAddress lat={40.7128} lng={-74.006} address="123 Main St, New York" />);

      expect(screen.getByText('Near 123 Main St, New York')).toBeInTheDocument();
    });

    it('should show coordinates as secondary when address available', () => {
      render(<SpotAddress lat={40.7128} lng={-74.006} address="123 Main St, New York" />);

      expect(screen.getByTestId('spot-coordinates-secondary')).toBeInTheDocument();
    });
  });

  describe('with coordinates only', () => {
    it('should display formatted coordinates', () => {
      render(<SpotAddress lat={40.7128} lng={-74.006} address={null} />);

      const coordsElement = screen.getByTestId('spot-coordinates-primary');
      expect(coordsElement).toBeInTheDocument();
      // Check format: should include N/S and E/W
      expect(coordsElement.textContent).toMatch(/40\.7128°N.*74\.0060°W/);
    });

    it('should handle negative coordinates', () => {
      render(<SpotAddress lat={-33.8688} lng={151.2093} address={null} />);

      const coordsElement = screen.getByTestId('spot-coordinates-primary');
      expect(coordsElement.textContent).toMatch(/33\.8688°S.*151\.2093°E/);
    });
  });

  describe('with no location data', () => {
    it('should show "Location not available" when no coords or address', () => {
      render(<SpotAddress lat={null} lng={null} address={null} />);

      expect(screen.getByText('Location not available')).toBeInTheDocument();
      expect(screen.getByTestId('spot-address-unavailable')).toBeInTheDocument();
    });
  });

  describe('loading state', () => {
    it('should show loading indicator when isLoading is true', () => {
      render(<SpotAddress lat={40.7128} lng={-74.006} address={null} isLoading />);

      expect(screen.getByTestId('spot-address-loading')).toBeInTheDocument();
    });

    it('should not show coordinates when loading', () => {
      render(<SpotAddress lat={40.7128} lng={-74.006} address={null} isLoading />);

      expect(screen.queryByTestId('spot-coordinates-primary')).not.toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle address without coordinates', () => {
      render(<SpotAddress lat={null} lng={null} address="Manually entered address" />);

      expect(screen.getByText('Near Manually entered address')).toBeInTheDocument();
      expect(screen.queryByTestId('spot-coordinates-secondary')).not.toBeInTheDocument();
    });

    it('should handle zero coordinates', () => {
      render(<SpotAddress lat={0} lng={0} address={null} />);

      const coordsElement = screen.getByTestId('spot-coordinates-primary');
      expect(coordsElement).toBeInTheDocument();
      expect(coordsElement.textContent).toMatch(/0\.0000°N.*0\.0000°E/);
    });
  });
});
