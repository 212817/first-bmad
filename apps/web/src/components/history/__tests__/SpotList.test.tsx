// apps/web/src/components/history/__tests__/SpotList.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { SpotList } from '../SpotList';
import { useCarTagStore } from '@/stores/carTagStore';
import type { Spot } from '@/stores/spot.types';

vi.mock('@/stores/carTagStore');

// Mock react-window v2 to use a simple div-based renderer for testing
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
  meterExpiresAt: null,
  isActive: false,
  savedAt: new Date().toISOString(),
  ...overrides,
});

describe('SpotList', () => {
  const defaultProps = {
    spots: [] as Spot[],
    hasMore: false,
    isLoadingMore: false,
    loadMore: vi.fn().mockResolvedValue(undefined),
    onSpotClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCarTagStore).mockReturnValue({
      tags: [],
      isLoading: false,
      error: null,
      fetchTags: vi.fn(),
      createTag: vi.fn(),
      updateTag: vi.fn(),
      deleteTag: vi.fn(),
      getTagById: vi.fn().mockReturnValue(null),
    });
  });

  it('should render the spot list container', () => {
    render(<SpotList {...defaultProps} />);

    expect(screen.getByTestId('spot-list')).toBeInTheDocument();
  });

  it('should render spots', async () => {
    const spots = [
      createMockSpot({ address: 'First Street' }),
      createMockSpot({ address: 'Second Street' }),
    ];

    render(<SpotList {...defaultProps} spots={spots} />);

    await waitFor(() => {
      expect(screen.getByText('First Street')).toBeInTheDocument();
      expect(screen.getByText('Second Street')).toBeInTheDocument();
    });
  });

  it('should render virtualized list element', async () => {
    const spots = [createMockSpot()];

    render(<SpotList {...defaultProps} spots={spots} />);

    expect(screen.getByTestId('virtualized-list')).toBeInTheDocument();
  });

  it('should call onSpotClick when a spot is clicked', async () => {
    const spots = [createMockSpot({ address: 'Clickable Street' })];
    const onSpotClick = vi.fn();

    render(<SpotList {...defaultProps} spots={spots} onSpotClick={onSpotClick} />);

    await waitFor(() => {
      screen.getByText('Clickable Street').click();
    });

    expect(onSpotClick).toHaveBeenCalledWith(spots[0]);
  });

  it('should render multiple spots', async () => {
    const spots = Array.from({ length: 10 }, (_, i) =>
      createMockSpot({ id: `spot-${i}`, address: `Street ${i}` })
    );

    render(<SpotList {...defaultProps} spots={spots} />);

    await waitFor(() => {
      expect(screen.getByText('Street 0')).toBeInTheDocument();
      expect(screen.getByText('Street 5')).toBeInTheDocument();
    });
  });
});
