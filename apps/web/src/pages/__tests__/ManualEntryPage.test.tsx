// apps/web/src/pages/__tests__/ManualEntryPage.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ManualEntryPage } from '../ManualEntryPage';
import { useSpotStore } from '@/stores/spotStore';
import { useGuestStore } from '@/stores/guestStore';
import { useAuthStore } from '@/stores/authStore';
import * as geocodingApi from '@/services/api/geocodingApi';

// Mock the geocoding API
vi.mock('@/services/api/geocodingApi', () => ({
  geocodingApi: {
    geocodeAddress: vi.fn(),
  },
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const renderWithRouter = () => {
  return render(
    <MemoryRouter initialEntries={['/manual-entry']}>
      <Routes>
        <Route path="/manual-entry" element={<ManualEntryPage />} />
        <Route
          path="/spot/:spotId/confirm"
          element={<div data-testid="confirm-page">Confirm</div>}
        />
        <Route path="/" element={<div data-testid="home-page">Home</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('ManualEntryPage', () => {
  const mockSaveSpot = vi.fn();

  beforeEach(() => {
    vi.resetAllMocks();

    // Reset stores to default state
    useSpotStore.setState({
      currentSpot: null,
      isLoading: false,
      isSaving: false,
      error: null,
      saveSpot: mockSaveSpot,
    });

    useGuestStore.setState({
      isGuest: false,
    });

    useAuthStore.setState({
      authMode: 'authenticated',
    });
  });

  describe('rendering', () => {
    it('should render the page title', () => {
      renderWithRouter();

      expect(screen.getByText('Enter Address Manually')).toBeInTheDocument();
    });

    it('should render the address input form', () => {
      renderWithRouter();

      expect(screen.getByPlaceholderText(/123 Main St/i)).toBeInTheDocument();
    });

    it('should render the back button', () => {
      renderWithRouter();

      expect(screen.getByText('Back')).toBeInTheDocument();
    });
  });

  describe('guest mode', () => {
    beforeEach(() => {
      useGuestStore.setState({ isGuest: true });
      useAuthStore.setState({ authMode: 'guest' });
    });

    it('should show guest mode banner', () => {
      renderWithRouter();

      // Check for the GuestModeBanner (sticky banner at top)
      expect(screen.getByText(/Data stored locally only/i)).toBeInTheDocument();
    });

    it('should save address directly without geocoding for guests', async () => {
      const mockSpot = { id: 'guest-spot-123' };
      mockSaveSpot.mockResolvedValue(mockSpot);

      renderWithRouter();

      // Enter address
      const input = screen.getByPlaceholderText(/123 Main St/i);
      fireEvent.change(input, { target: { value: '123 Test Street, City' } });

      // Submit
      const submitButton = screen.getByRole('button', { name: /save spot/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSaveSpot).toHaveBeenCalledWith({
          address: '123 Test Street, City',
        });
      });

      // Should NOT call geocoding API for guests
      expect(geocodingApi.geocodingApi.geocodeAddress).not.toHaveBeenCalled();

      // Should navigate to confirm page
      expect(mockNavigate).toHaveBeenCalledWith('/spot/guest-spot-123/confirm');
    });

    it('should show warning about local-only storage for guests', () => {
      renderWithRouter();

      expect(
        screen.getByText(/Address will be saved locally without looking up coordinates/i)
      ).toBeInTheDocument();
    });
  });

  describe('authenticated user', () => {
    it('should geocode address and save with coordinates', async () => {
      const mockSpot = { id: 'auth-spot-123' };
      mockSaveSpot.mockResolvedValue(mockSpot);
      vi.mocked(geocodingApi.geocodingApi.geocodeAddress).mockResolvedValue({
        lat: 40.7128,
        lng: -74.006,
        formattedAddress: '123 Test Street, New York, NY',
      });

      renderWithRouter();

      // Enter address
      const input = screen.getByPlaceholderText(/123 Main St/i);
      fireEvent.change(input, { target: { value: '123 Test Street' } });

      // Submit
      const submitButton = screen.getByRole('button', { name: /save spot/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(geocodingApi.geocodingApi.geocodeAddress).toHaveBeenCalledWith('123 Test Street');
      });

      await waitFor(() => {
        expect(mockSaveSpot).toHaveBeenCalledWith({
          address: '123 Test Street, New York, NY',
          lat: 40.7128,
          lng: -74.006,
        });
      });

      expect(mockNavigate).toHaveBeenCalledWith('/spot/auth-spot-123/confirm');
    });

    it('should save address only when geocoding returns no results', async () => {
      const mockSpot = { id: 'fallback-spot-123' };
      mockSaveSpot.mockResolvedValue(mockSpot);
      vi.mocked(geocodingApi.geocodingApi.geocodeAddress).mockResolvedValue(null);

      renderWithRouter();

      // Enter address
      const input = screen.getByPlaceholderText(/123 Main St/i);
      fireEvent.change(input, { target: { value: 'Unknown Address' } });

      // Submit
      const submitButton = screen.getByRole('button', { name: /save spot/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSaveSpot).toHaveBeenCalledWith({
          address: 'Unknown Address',
        });
      });
    });

    it('should save address only when geocoding fails with error', async () => {
      const mockSpot = { id: 'error-spot-123' };
      mockSaveSpot.mockResolvedValue(mockSpot);
      vi.mocked(geocodingApi.geocodingApi.geocodeAddress).mockRejectedValue(
        new Error('Network error')
      );

      renderWithRouter();

      // Enter address
      const input = screen.getByPlaceholderText(/123 Main St/i);
      fireEvent.change(input, { target: { value: '123 Error Test' } });

      // Submit
      const submitButton = screen.getByRole('button', { name: /save spot/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockSaveSpot).toHaveBeenCalledWith({
          address: '123 Error Test',
        });
      });
    });
  });

  describe('navigation', () => {
    it('should navigate back to home when back button is clicked', () => {
      renderWithRouter();

      const backButton = screen.getByText('Back');
      fireEvent.click(backButton);

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });
});
