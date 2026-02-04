// apps/web/src/pages/__tests__/HistoryPage.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HistoryPage } from '../HistoryPage';
import { useSpotStore } from '@/stores/spotStore';
import { useCarTagStore } from '@/stores/carTagStore';
import type { Spot } from '@/stores/spot.types';

// Mock the stores
vi.mock('@/stores/spotStore');
vi.mock('@/stores/carTagStore');

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

// Mock react-window v2 for testing
vi.mock('react-window', () => ({
  List: vi.fn(({ rowCount, rowComponent: RowComponent, rowProps }) => {
    const items = [];
    for (let i = 0; i < Math.min(rowCount, 20); i++) {
      const props = typeof rowProps === 'function' ? rowProps({ rowIndex: i }) : rowProps;
      items.push(
        <div key={i}>
          <RowComponent
            index={i}
            style={{}}
            ariaAttributes={{ 'aria-posinset': i + 1, 'aria-setsize': rowCount, role: 'listitem' }}
            {...props}
          />
        </div>
      );
    }
    return <div data-testid="virtualized-list">{items}</div>;
  }),
}));

// Mock react-window-infinite-loader v2
vi.mock('react-window-infinite-loader', () => ({
  useInfiniteLoader: vi.fn(() => vi.fn()),
}));

const createMockSpot = (overrides: Partial<Spot> = {}): Spot => ({
  id: `spot-${Math.random().toString(36).slice(2)}`,
  carTagId: null,
  lat: 40.7128,
  lng: -74.006,
  accuracyMeters: 15,
  address: '123 Main St',
  photoUrl: null,
  note: null,
  floor: null,
  spotIdentifier: null,
  isActive: false,
  savedAt: new Date().toISOString(),
  ...overrides,
});

describe('HistoryPage', () => {
  const mockFetchSpots = vi.fn();
  const mockLoadMore = vi.fn();
  const mockClearHistory = vi.fn();
  const mockFetchTags = vi.fn();
  const mockSetSearchQuery = vi.fn();
  const mockSetFilters = vi.fn();
  const mockClearFilters = vi.fn();

  const baseMockSpotStore = {
    spots: [] as Spot[],
    hasMore: false,
    isLoadingSpots: false,
    isLoadingMore: false,
    fetchSpots: mockFetchSpots,
    loadMore: mockLoadMore,
    clearHistory: mockClearHistory,
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
    getSpotById: vi.fn(),
    deleteSpot: vi.fn(),
    // Search/filter state
    searchQuery: '',
    filters: {},
    setSearchQuery: mockSetSearchQuery,
    setFilters: mockSetFilters,
    clearFilters: mockClearFilters,
  };

  const baseMockCarTagStore = {
    tags: [],
    isLoading: false,
    error: null,
    fetchTags: mockFetchTags,
    createTag: vi.fn(),
    updateTag: vi.fn(),
    deleteTag: vi.fn(),
    getTagById: vi.fn().mockReturnValue(null),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useSpotStore).mockReturnValue(baseMockSpotStore);
    vi.mocked(useCarTagStore).mockReturnValue(baseMockCarTagStore);
  });

  const renderPage = () => {
    return render(
      <MemoryRouter>
        <HistoryPage />
      </MemoryRouter>
    );
  };

  describe('loading state', () => {
    it('should show loading spinner when loading initial spots', () => {
      vi.mocked(useSpotStore).mockReturnValue({
        ...baseMockSpotStore,
        isLoadingSpots: true,
        spots: [],
      });

      renderPage();

      expect(screen.getByText('Loading spots...')).toBeInTheDocument();
    });
  });

  describe('empty state', () => {
    it('should show empty state when no spots', () => {
      renderPage();

      expect(screen.getByTestId('history-empty-state')).toBeInTheDocument();
    });
  });

  describe('with spots', () => {
    it('should render spots list', async () => {
      const spots = [
        createMockSpot({ address: 'First Address' }),
        createMockSpot({ address: 'Second Address' }),
      ];

      vi.mocked(useSpotStore).mockReturnValue({
        ...baseMockSpotStore,
        spots,
      });

      renderPage();

      await waitFor(() => {
        expect(screen.getByText('First Address')).toBeInTheDocument();
        expect(screen.getByText('Second Address')).toBeInTheDocument();
      });
    });

    it('should call fetchSpots on mount', () => {
      renderPage();

      expect(mockFetchSpots).toHaveBeenCalled();
    });

    it('should call fetchTags on mount', () => {
      renderPage();

      expect(mockFetchTags).toHaveBeenCalled();
    });

    it('should clear history on mount', () => {
      renderPage();

      expect(mockClearHistory).toHaveBeenCalled();
    });
  });

  describe('navigation', () => {
    it('should navigate to spot detail when spot is clicked', async () => {
      const spots = [createMockSpot({ id: 'spot-123', address: 'Test Address' })];

      vi.mocked(useSpotStore).mockReturnValue({
        ...baseMockSpotStore,
        spots,
      });

      renderPage();

      await waitFor(() => {
        screen.getByText('Test Address').click();
      });

      expect(mockNavigate).toHaveBeenCalledWith('/spot/spot-123');
    });

    it('should navigate back to home when back button clicked', () => {
      renderPage();

      screen.getByLabelText('Go back').click();

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('header', () => {
    it('should display "Spot History" title', () => {
      renderPage();

      expect(screen.getByRole('heading', { name: 'Spot History' })).toBeInTheDocument();
    });
  });
});
