// apps/web/src/components/ui/NoCoordinatesWarning.tsx

/**
 * Warning banner displayed when a spot has no GPS coordinates
 * Informs user that navigation may be less accurate
 */
export const NoCoordinatesWarning = () => {
  return (
    <div
      className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm"
      data-testid="no-coordinates-warning"
      role="alert"
      aria-live="polite"
    >
      <svg
        className="w-5 h-5 flex-shrink-0"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <span>
        Navigation may be less accurate without GPS coordinates. Try enabling location permission
        for better results.
      </span>
    </div>
  );
};
