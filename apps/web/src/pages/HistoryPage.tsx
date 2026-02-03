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

  // Render content based on state
  const renderContent = () => {
    // Initial loading state
    if (isLoadingSpots && spots.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3 text-gray-500">
            <div
              className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"
              aria-hidden="true"
            />
            <span>Loading spots...</span>
          </div>
        </div>
      );
    }

    // Empty state
    if (!isLoadingSpots && spots.length === 0) {
      return (
        <div className="p-4">
          <EmptySpotState />
        </div>
      );
    }

    // List content
    return (
      <SpotList
        spots={spots}
        hasMore={hasMore}
        isLoadingMore={isLoadingMore}
        loadMore={loadMore}
        onSpotClick={handleSpotClick}
      />
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center" data-testid="history-page">
      <div className="w-full max-w-7xl bg-white min-h-screen relative shadow-xl flex flex-col">
        {/* Header - Sticky top */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 h-16 px-4 sm:px-6 lg:px-8 flex items-center">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBackClick}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors text-gray-700 flex items-center gap-2"
              aria-label="Go back"
            >
              <span className="text-xl" aria-hidden="true">←</span>
            </button>
            <h1 className="text-xl font-bold text-gray-900">Spot History</h1>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};
