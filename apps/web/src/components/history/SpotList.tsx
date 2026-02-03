// apps/web/src/components/history/SpotList.tsx
import { useCallback, useEffect, useState, type ReactElement } from 'react';
import { List } from 'react-window';
import { useInfiniteLoader } from 'react-window-infinite-loader';
import { HistorySpotItem } from './HistorySpotItem';
import type { SpotListProps } from './types';
import type { Spot } from '@/stores/spot.types';

const ITEM_HEIGHT = 80; // Height of each spot item in pixels
const HEADER_HEIGHT = 64; // Height of the header

// Props passed to row component via rowProps
interface RowExtraProps {
  spots: Spot[];
  hasMore: boolean;
  onSpotClick: (spot: Spot) => void;
}

// Full props received by row component (aria + index + style + extra)
interface RowProps {
  ariaAttributes: {
    'aria-posinset': number;
    'aria-setsize': number;
    role: 'listitem';
  };
  index: number;
  style: React.CSSProperties;
  spots: Spot[];
  hasMore: boolean;
  onSpotClick: (spot: Spot) => void;
}

/**
 * Row component for the virtualized list
 */
const RowComponent = ({
  index,
  style,
  spots,
  hasMore,
  onSpotClick,
}: RowProps): ReactElement | null => {
  const isLoading = hasMore && index >= spots.length;

  // Show loading indicator for unloaded item
  if (isLoading) {
    return (
      <div style={style} className="flex items-center justify-center p-4">
        <div className="flex items-center gap-2 text-gray-500">
          <div
            className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"
            aria-hidden="true"
          />
          <span className="text-sm">Loading more...</span>
        </div>
      </div>
    );
  }

  const spot = spots[index];
  if (!spot) return null;

  return (
    <div style={style}>
      <HistorySpotItem spot={spot} onClick={() => onSpotClick(spot)} />
    </div>
  );
};

/**
 * Virtualized spot list component for efficient rendering of large lists
 * Uses react-window v2 for virtualization and infinite scrolling
 */
export const SpotList = ({
  spots,
  hasMore,
  isLoadingMore,
  loadMore,
  onSpotClick,
}: SpotListProps) => {
  const [listHeight, setListHeight] = useState(
    typeof window !== 'undefined' ? window.innerHeight - HEADER_HEIGHT : 600
  );

  // Update list height on window resize
  useEffect(() => {
    const handleResize = () => {
      setListHeight(window.innerHeight - HEADER_HEIGHT);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Determine row count (add 1 for loading indicator if there's more to load)
  const rowCount = hasMore ? spots.length + 1 : spots.length;

  // Check if a row at index is loaded
  const isRowLoaded = useCallback(
    (index: number) => !hasMore || index < spots.length,
    [hasMore, spots.length]
  );

  // Load more rows when requested by InfiniteLoader
  const loadMoreRows = useCallback(async () => {
    if (!isLoadingMore) {
      await loadMore();
    }
  }, [isLoadingMore, loadMore]);

  // Use the hook-based infinite loader API (v2)
  const onRowsRendered = useInfiniteLoader({
    isRowLoaded,
    loadMoreRows,
    rowCount,
    threshold: 5,
  });

  // Static row props for the List component
  const rowProps: RowExtraProps = {
    spots,
    hasMore,
    onSpotClick,
  };

  return (
    <div data-testid="spot-list">
      <List<RowExtraProps>
        rowCount={rowCount}
        rowHeight={ITEM_HEIGHT}
        defaultHeight={listHeight}
        onRowsRendered={onRowsRendered}
        className="scrollbar-thin scrollbar-thumb-gray-300"
        rowComponent={RowComponent}
        rowProps={rowProps}
      />
    </div>
  );
};
