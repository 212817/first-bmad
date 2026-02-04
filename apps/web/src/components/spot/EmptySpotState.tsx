// apps/web/src/components/spot/EmptySpotState.tsx
import type { EmptySpotStateProps } from './types';

/**
 * Empty state component when no parking spot is saved
 * Shows message and prompt to save first spot
 */
export const EmptySpotState = ({
  className = '',
  testId = 'empty-spot-state',
}: EmptySpotStateProps) => {
  return (
    <div
      className={`bg-white rounded-xl shadow-md p-6 text-center ${className}`}
      data-testid={testId}
    >
      {/* Illustration/icon */}
      <div className="mb-4">
        <span className="text-5xl" role="img" aria-label="Parking icon">
          🅿️
        </span>
      </div>

      {/* Main message */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">No parking spot saved yet</h3>

      {/* Prompt */}
      <p className="text-sm text-gray-500">Tap below to save your first spot</p>
    </div>
  );
};
