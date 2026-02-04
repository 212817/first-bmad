// apps/web/src/components/spot/NoResultsState.tsx
import type { NoResultsStateProps } from './types';

/**
 * Empty state shown when search/filter returns no results
 * Different from EmptySpotState which is for no spots saved
 */
export const NoResultsState = ({ onClear }: NoResultsStateProps) => {
  return (
    <div
      className="flex flex-col items-center justify-center p-8 text-center"
      data-testid="no-results-state"
    >
      {/* Search icon */}
      <span className="text-5xl mb-4" role="img" aria-label="Search icon">
        🔍
      </span>

      {/* Message */}
      <h2 className="text-lg font-medium text-gray-700">No spots found</h2>
      <p className="text-gray-500 mt-1">Try adjusting your search or filters</p>

      {/* Clear button */}
      <button
        type="button"
        onClick={onClear}
        className="mt-4 text-indigo-600 font-medium hover:text-indigo-700 transition-colors"
        data-testid="clear-filters-button"
      >
        Clear filters
      </button>
    </div>
  );
};
