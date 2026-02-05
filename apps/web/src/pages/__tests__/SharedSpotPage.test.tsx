// apps/web/src/pages/__tests__/SharedSpotPage.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { SharedSpotPage } from '../SharedSpotPage';
import { shareApi } from '@/services/api/shareApi';

// Mock the share API
vi.mock('@/services/api/shareApi', () => ({
  shareApi: {
    getSharedSpot: vi.fn(),
  },
}));

// Mock the navigation service
vi.mock('@/services/navigation/navigation.service', () => ({
  navigationService: {
    navigateTo: vi.fn(),
  },
}));

// Mock SpotMap component
vi.mock('@/components/map/SpotMap', () => ({
  SpotMap: ({ testId }: { testId?: string }) => <div data-testid={testId || 'spot-map'}>Map</div>,
}));

const mockSharedSpot = {
  id: 'spot-123',
  lat: 40.7128,
  lng: -74.006,
  address: '123 Main St, New York, NY',
  photoUrl: 'https://example.com/photo.jpg',
  note: 'Near the elevator',
  floor: 'B2',
  spotIdentifier: 'A-15',
  savedAt: '2026-01-15T10:00:00.000Z',
  expiresAt: '2026-01-22T10:00:00.000Z',
};

const renderWithRouter = (token: string) => {
  return render(
    <MemoryRouter initialEntries={[`/s/${token}`]}>
      <Routes>
        <Route path="/s/:token" element={<SharedSpotPage />} />
        <Route path="/" element={<div>Home Page</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('SharedSpotPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state initially', () => {
    vi.mocked(shareApi.getSharedSpot).mockImplementation(
      () => new Promise(() => {}) // Never resolves
    );

    renderWithRouter('valid-token');

    expect(screen.getByTestId('shared-spot-loading')).toBeInTheDocument();
    expect(screen.getByText('Loading shared spot...')).toBeInTheDocument();
  });

  it('displays shared spot data on success', async () => {
    vi.mocked(shareApi.getSharedSpot).mockResolvedValue(mockSharedSpot);

    renderWithRouter('valid-token');

    await waitFor(() => {
      expect(screen.getByTestId('shared-spot-page')).toBeInTheDocument();
    });

    expect(screen.getByText('Shared Parking Spot')).toBeInTheDocument();
    expect(screen.getByText('123 Main St, New York, NY')).toBeInTheDocument();
  });

  it('shows not found state for invalid token', async () => {
    vi.mocked(shareApi.getSharedSpot).mockRejectedValue(new Error('404 Not Found'));

    renderWithRouter('invalid-token');

    await waitFor(() => {
      expect(screen.getByTestId('shared-spot-not-found')).toBeInTheDocument();
    });

    expect(screen.getByText('Link Expired or Invalid')).toBeInTheDocument();
    expect(screen.getByText('Go to Where Did I Park')).toBeInTheDocument();
  });

  it('displays note when present', async () => {
    vi.mocked(shareApi.getSharedSpot).mockResolvedValue(mockSharedSpot);

    renderWithRouter('valid-token');

    await waitFor(() => {
      expect(screen.getByTestId('shared-spot-note')).toBeInTheDocument();
    });

    expect(screen.getByText('Near the elevator')).toBeInTheDocument();
  });

  it('displays floor and spot identifier when present', async () => {
    vi.mocked(shareApi.getSharedSpot).mockResolvedValue(mockSharedSpot);

    renderWithRouter('valid-token');

    await waitFor(() => {
      expect(screen.getByText('B2')).toBeInTheDocument();
    });

    expect(screen.getByText('A-15')).toBeInTheDocument();
  });

  it('shows navigate button when coordinates are available', async () => {
    vi.mocked(shareApi.getSharedSpot).mockResolvedValue(mockSharedSpot);

    renderWithRouter('valid-token');

    await waitFor(() => {
      expect(screen.getByTestId('shared-spot-navigate-button')).toBeInTheDocument();
    });

    expect(screen.getByTestId('shared-spot-navigate-button')).not.toBeDisabled();
  });

  it('disables navigate button when no coordinates', async () => {
    vi.mocked(shareApi.getSharedSpot).mockResolvedValue({
      ...mockSharedSpot,
      lat: null,
      lng: null,
    });

    renderWithRouter('valid-token');

    await waitFor(() => {
      expect(screen.getByTestId('shared-spot-navigate-button')).toBeInTheDocument();
    });

    expect(screen.getByTestId('shared-spot-navigate-button')).toBeDisabled();
  });

  it('does not require authentication', async () => {
    vi.mocked(shareApi.getSharedSpot).mockResolvedValue(mockSharedSpot);

    renderWithRouter('valid-token');

    await waitFor(() => {
      expect(screen.getByTestId('shared-spot-page')).toBeInTheDocument();
    });

    // Should have called the API with the token
    expect(shareApi.getSharedSpot).toHaveBeenCalledWith('valid-token');
  });
});
