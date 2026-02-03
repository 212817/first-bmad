// apps/web/src/pages/__tests__/SpotDetailPage.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { SpotDetailPage } from '../SpotDetailPage';
import { useSpotStore } from '@/stores/spotStore';
import { useCarTagStore } from '@/stores/carTagStore';
import { navigationService } from '@/services/navigation/navigation.service';
import type { Spot } from '@/stores/spot.types';

// Mock the stores
vi.mock('@/stores/spotStore');
vi.mock('@/stores/carTagStore');
vi.mock('@/services/navigation/navigation.service');

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

const createMockSpot = (overrides: Partial<Spot> = {}): Spot => ({
  id: 'test-spot-id',
  carTagId: null,
  lat: 40.7128,
  lng: -74.006,
  accuracyMeters: 15,
  address: '123 Main St, New York, NY',
  photoUrl: null,
  note: null,
  floor: null,
  spotIdentifier: null,
  isActive: true,
  savedAt: '2026-01-15T15:45:00Z',
  ...overrides,
});

const renderWithRouter = (spotId: string = 'test-spot-id') => {
  return render(
    <MemoryRouter initialEntries={[`/spot/${spotId}`]}>
      <Routes>
        <Route path="/spot/:spotId" element={<SpotDetailPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('SpotDetailPage', () => {
  const mockGetSpotById = vi.fn();
  const mockFetchTags = vi.fn();
  const mockGetTagById = vi.fn();
  const mockNavigateTo = vi.fn();

  const baseMockSpotStore = {
    spots: [] as Spot[],
    hasMore: false,
    isLoadingSpots: false,
    isLoadingMore: false,
    fetchSpots: vi.fn(),
    loadMore: vi.fn(),
    clearHistory: vi.fn(),
    currentSpot: null,
    latestSpot: null,
    isLoading: false,
    isLoadingLatest: false,
    isSaving: false,
    error: null,
    nextCursor: null,
    saveSpot: vi.fn(),
    updateSpot: vi.fn(),
    fetchLatestSpot: vi.fn(),
    clearSpot: vi.fn(),
    setLoading: vi.fn(),
    setError: vi.fn(),
    getSpotById: mockGetSpotById,
  };

  const baseMockCarTagStore = {
    tags: [],
    isLoading: false,
    error: null,
    fetchTags: mockFetchTags,
    createTag: vi.fn(),
    updateTag: vi.fn(),
    deleteTag: vi.fn(),
    getTagById: mockGetTagById,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useSpotStore).mockReturnValue(baseMockSpotStore);
    vi.mocked(useCarTagStore).mockReturnValue(baseMockCarTagStore);
    vi.mocked(navigationService.navigateTo).mockImplementation(mockNavigateTo);
    mockFetchTags.mockResolvedValue(undefined);
    mockGetTagById.mockReturnValue(null);
  });

  describe('Loading state', () => {
    it('should show loading state initially', () => {
      mockGetSpotById.mockImplementation(() => new Promise(() => {})); // Never resolves

      renderWithRouter();

      expect(screen.getByTestId('spot-detail-loading')).toBeInTheDocument();
      expect(screen.getByText('Loading spot...')).toBeInTheDocument();
    });
  });

  describe('Not found state', () => {
    it('should show not found when spot is null', async () => {
      mockGetSpotById.mockResolvedValue(null);

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('spot-detail-not-found')).toBeInTheDocument();
      });
      expect(screen.getByText('Spot Not Found')).toBeInTheDocument();
    });

    it('should show error message when fetch fails', async () => {
      mockGetSpotById.mockRejectedValue(new Error('Network error'));

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('spot-detail-not-found')).toBeInTheDocument();
      });
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });

    it('should navigate to history when clicking "View All Spots"', async () => {
      mockGetSpotById.mockResolvedValue(null);

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByText('View All Spots')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('View All Spots'));
      expect(mockNavigate).toHaveBeenCalledWith('/history');
    });
  });

  describe('Successful render with all fields', () => {
    it('should render spot with all fields', async () => {
      const spot = createMockSpot({
        note: 'By the big oak tree',
        photoUrl: 'https://example.com/photo.jpg',
      });
      mockGetSpotById.mockResolvedValue(spot);

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('spot-detail-page')).toBeInTheDocument();
      });

      // Check address is displayed
      expect(screen.getByTestId('location-address')).toHaveTextContent('123 Main St, New York, NY');

      // Check timestamp
      expect(screen.getByTestId('spot-timestamp')).toBeInTheDocument();

      // Check note
      expect(screen.getByTestId('spot-note')).toHaveTextContent('By the big oak tree');

      // Check buttons
      expect(screen.getByTestId('navigate-button')).toBeInTheDocument();
      expect(screen.getByTestId('share-button')).toBeInTheDocument();
      expect(screen.getByTestId('delete-button')).toBeInTheDocument();
    });
  });

  describe('Render with missing photo', () => {
    it('should show placeholder when no photo', async () => {
      const spot = createMockSpot({ photoUrl: null });
      mockGetSpotById.mockResolvedValue(spot);

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('spot-photo-placeholder')).toBeInTheDocument();
      });
    });
  });

  describe('Render with missing note', () => {
    it('should not show note section when note is null', async () => {
      const spot = createMockSpot({ note: null });
      mockGetSpotById.mockResolvedValue(spot);

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('spot-detail-page')).toBeInTheDocument();
      });

      expect(screen.queryByTestId('spot-note')).not.toBeInTheDocument();
    });
  });

  describe('Navigation button', () => {
    it('should call navigateTo when clicking Navigate', async () => {
      const spot = createMockSpot();
      mockGetSpotById.mockResolvedValue(spot);

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('navigate-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('navigate-button'));

      expect(mockNavigateTo).toHaveBeenCalledWith({
        lat: spot.lat,
        lng: spot.lng,
        address: spot.address,
      });
    });

    it('should disable navigate button when no coordinates', async () => {
      const spot = createMockSpot({ lat: null, lng: null, address: 'Some address' });
      mockGetSpotById.mockResolvedValue(spot);

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('navigate-button')).toBeInTheDocument();
      });

      expect(screen.getByTestId('navigate-button')).toBeDisabled();
    });
  });

  describe('Delete button', () => {
    it('should navigate to delete confirmation when clicking Delete', async () => {
      const spot = createMockSpot();
      mockGetSpotById.mockResolvedValue(spot);

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('delete-button')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByTestId('delete-button'));

      expect(mockNavigate).toHaveBeenCalledWith('/spot/test-spot-id/delete');
    });
  });

  describe('Share button', () => {
    it('should be disabled (placeholder for Epic 4)', async () => {
      const spot = createMockSpot();
      mockGetSpotById.mockResolvedValue(spot);

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('share-button')).toBeInTheDocument();
      });

      expect(screen.getByTestId('share-button')).toBeDisabled();
    });
  });

  describe('Back navigation', () => {
    it('should navigate back when clicking back button', async () => {
      const spot = createMockSpot();
      mockGetSpotById.mockResolvedValue(spot);

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByLabelText('Go back')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByLabelText('Go back'));

      expect(mockNavigate).toHaveBeenCalledWith(-1);
    });
  });

  describe('Car tag display', () => {
    it('should show default tag when no carTagId', async () => {
      const spot = createMockSpot({ carTagId: null });
      mockGetSpotById.mockResolvedValue(spot);
      mockGetTagById.mockReturnValue(null);

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('tag-badge')).toBeInTheDocument();
      });

      expect(screen.getByTestId('tag-badge')).toHaveTextContent('My Car');
    });

    it('should show custom tag when carTagId is set', async () => {
      const spot = createMockSpot({ carTagId: 'tag-1' });
      mockGetSpotById.mockResolvedValue(spot);
      mockGetTagById.mockReturnValue({ id: 'tag-1', name: 'Work Car', color: '#FF0000' });

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('tag-badge')).toBeInTheDocument();
      });

      expect(screen.getByTestId('tag-badge')).toHaveTextContent('Work Car');
    });
  });

  describe('Photo zoom', () => {
    it('should toggle photo zoom when tapping photo', async () => {
      const spot = createMockSpot({ photoUrl: 'https://example.com/photo.jpg' });
      mockGetSpotById.mockResolvedValue(spot);

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('spot-detail-page')).toBeInTheDocument();
      });

      // Photo should be visible (not zoomed initially)
      expect(screen.getByTestId('spot-photo')).toBeInTheDocument();

      // Click to zoom
      fireEvent.click(screen.getByTestId('spot-photo'));

      // Should now show zoomed state
      await waitFor(() => {
        expect(screen.getByTestId('spot-photo-zoomed')).toBeInTheDocument();
      });

      // Click to close zoom
      fireEvent.click(screen.getByTestId('spot-photo-zoomed'));

      // Should return to normal state
      await waitFor(() => {
        expect(screen.getByTestId('spot-photo')).toBeInTheDocument();
      });
    });
  });

  describe('Share button interaction', () => {
    it('should handle share button click gracefully', async () => {
      const spot = createMockSpot();
      mockGetSpotById.mockResolvedValue(spot);

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('share-button')).toBeInTheDocument();
      });

      // Click share button - should not throw
      fireEvent.click(screen.getByTestId('share-button'));

      // Button should still be there
      expect(screen.getByTestId('share-button')).toBeInTheDocument();
    });
  });

  describe('Error handling', () => {
    it('should show default message when error is not an Error instance', async () => {
      mockGetSpotById.mockRejectedValue('Some string error');

      renderWithRouter();

      await waitFor(() => {
        expect(screen.getByTestId('spot-detail-not-found')).toBeInTheDocument();
      });
      expect(screen.getByText('Failed to load spot')).toBeInTheDocument();
    });
  });
});
