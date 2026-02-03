// apps/web/src/pages/HistoryPage.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSpotStore } from '@/stores/spotStore';
import { useCarTagStore } from '@/stores/carTagStore';
import { SpotList } from '@/components/history/SpotList';
import { EmptySpotState } from '@/components/spot/EmptySpotState';
import type { Spot } from '@/stores/spot.types';

/**
 * History page showing all saved parking spots
 * Supports infinite scrolling with virtualized list
 */
export const HistoryPage = () => {
  const navigate = useNavigate();
  const { spots, hasMore, isLoadingSpots, isLoadingMore, fetchSpots, loadMore, clearHistory } =
    useSpotStore();
  const { fetchTags } = useCarTagStore();

  // Fetch spots and car tags on mount
  useEffect(() => {
    clearHistory(); // Clear previous state
    fetchSpots();
    fetchTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Navigate to spot detail page when a spot is clicked
   */
  const handleSpotClick = (spot: Spot) => {
    navigate(`/spot/${spot.id}`);
  };

  /**
   * Navigate back to home
   */
  const handleBackClick = () => {
    navigate('/');
  };

  // Loading state for initial load
  if (isLoadingSpots && spots.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackClick}
              className="p-1 -ml-1 text-gray-600 hover:text-gray-900"
              aria-label="Go back"
            >
              <span className="text-xl">←</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900">Spot History</h1>
          </div>
        </header>
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3 text-gray-500">
            <div
              className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"
              aria-hidden="true"
            />
            <span>Loading spots...</span>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!isLoadingSpots && spots.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackClick}
              className="p-1 -ml-1 text-gray-600 hover:text-gray-900"
              aria-label="Go back"
            >
              <span className="text-xl">←</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900">Spot History</h1>
          </div>
        </header>
        <div className="p-4">
          <EmptySpotState />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50" data-testid="history-page">
      <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-4">
        <div className="flex items-center gap-3">
          <button
            onClick={handleBackClick}
            className="p-1 -ml-1 text-gray-600 hover:text-gray-900"
            aria-label="Go back"
          >
            <span className="text-xl">←</span>
          </button>
          <h1 className="text-xl font-bold text-gray-900">Spot History</h1>
        </div>
      </header>

      <SpotList
        spots={spots}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        loadMore={loadMore}
        onSpotClick={handleSpotClick}
      />
    </div>
  );
};
