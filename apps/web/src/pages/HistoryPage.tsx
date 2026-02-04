// apps/web/src/pages/HistoryPage.tsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSpotStore } from '@/stores/spotStore';
import { useCarTagStore } from '@/stores/carTagStore';
import { SpotList } from '@/components/history/SpotList';
import { EmptySpotState, SpotSearchInput, SpotFilters, NoResultsState } from '@/components/spot';
import type { Spot } from '@/stores/spot.types';

/**
 * History page showing all saved parking spots
 * Supports infinite scrolling, search, and filtering
 */
export const HistoryPage = () => {
  const navigate = useNavigate();
  const {
    spots,
    hasMore,
    isLoadingSpots,
    isLoadingMore,
    searchQuery,
    filters,
    fetchSpots,
    loadMore,
    clearHistory,
    setSearchQuery,
    setFilters,
    clearFilters,
  } = useSpotStore();
  const { fetchTags } = useCarTagStore();

  // Whether any filters are active
  const hasActiveFilters = Boolean(searchQuery || filters.carTagId);

  // Fetch spots and car tags on mount
  useEffect(() => {
    clearHistory(); // Clear previous state
    fetchSpots();
    fetchTags();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Re-fetch when search/filters change
  useEffect(() => {
    fetchSpots();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery, filters]);

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

  /**
   * Handle search query change
   */
  const handleSearchChange = (query: string) => {
    setSearchQuery(query);
  };

  /**
   * Handle car tag filter change
   */
  const handleTagChange = (tagId: string | undefined) => {
    setFilters({ ...filters, carTagId: tagId });
  };

  /**
   * Clear all filters
   */
  const handleClearFilters = () => {
    clearFilters();
    fetchSpots();
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

    // No results after search/filter
    if (!isLoadingSpots && spots.length === 0 && hasActiveFilters) {
      return (
        <div className="p-4">
          <NoResultsState onClear={handleClearFilters} />
        </div>
      );
    }

    // Empty state (no spots saved at all)
    if (!isLoadingSpots && spots.length === 0) {
      return (
        <div className="p-4">
          <EmptySpotState testId="history-empty-state" />
        </div>
      );
    }

    // List content
    return (
      <>
        {/* Results count and clear button when filtered */}
        {hasActiveFilters && (
          <div className="px-4 py-2 bg-gray-50 flex justify-between items-center border-b border-gray-200">
            <span className="text-sm text-gray-600">
              {spots.length} result{spots.length !== 1 ? 's' : ''}
            </span>
            <button
              onClick={handleClearFilters}
              className="text-sm text-indigo-600 hover:text-indigo-700 font-medium"
              data-testid="clear-filters-inline"
            >
              Clear filters
            </button>
          </div>
        )}
        <SpotList
          spots={spots}
          hasMore={hasMore}
          isLoadingMore={isLoadingMore}
          loadMore={loadMore}
          onSpotClick={handleSpotClick}
        />
      </>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 flex justify-center" data-testid="history-page">
      <div className="w-full max-w-7xl bg-white min-h-screen relative shadow-xl flex flex-col">
        {/* Header - Sticky top */}
        <header className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8 py-3">
          <div className="flex items-center gap-3 mb-3">
            <button
              onClick={handleBackClick}
              className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors text-gray-700 flex items-center gap-2"
              aria-label="Go back"
            >
              <span className="text-xl" aria-hidden="true">
                ←
              </span>
            </button>
            <h1 className="text-xl font-bold text-gray-900">Spot History</h1>
          </div>

          {/* Search and Filter */}
          <div className="flex gap-2">
            <SpotSearchInput
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder="Search by address, note..."
            />
            <SpotFilters selectedTagId={filters.carTagId} onTagChange={handleTagChange} />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1">{renderContent()}</main>
      </div>
    </div>
  );
};
