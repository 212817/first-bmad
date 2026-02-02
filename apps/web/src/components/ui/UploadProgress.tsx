// apps/web/src/components/ui/UploadProgress.tsx
import type { UploadProgressProps } from './types';

/**
 * Upload progress indicator component
 * Shows progress bar, success state, or error state with retry option
 */
export const UploadProgress = ({
  status,
  progress,
  errorMessage,
  onRetry,
  onCancel,
}: UploadProgressProps) => {
  // Don't render anything when idle
  if (status === 'idle') {
    return null;
  }

  // Success state with checkmark
  if (status === 'success') {
    return (
      <div
        className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200"
        data-testid="upload-progress"
        data-status="success"
      >
        <div
          className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0"
          aria-hidden="true"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <span className="text-green-700 font-medium">Upload complete!</span>
        {onCancel && (
          <button
            onClick={onCancel}
            className="ml-auto text-green-600 hover:text-green-700 text-sm font-medium"
            data-testid="dismiss-button"
          >
            Dismiss
          </button>
        )}
      </div>
    );
  }

  // Error state with retry option
  if (status === 'error') {
    return (
      <div
        className="flex items-center gap-3 p-3 bg-red-50 rounded-lg border border-red-200"
        data-testid="upload-progress"
        data-status="error"
      >
        <div
          className="w-8 h-8 rounded-full bg-red-500 flex items-center justify-center flex-shrink-0"
          aria-hidden="true"
        >
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </div>
        <div className="flex-1">
          <span className="text-red-700 font-medium block">Upload failed</span>
          {errorMessage && (
            <span className="text-red-600 text-sm" data-testid="error-message">
              {errorMessage}
            </span>
          )}
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white text-sm font-medium rounded-md transition-colors"
            data-testid="retry-button"
          >
            Retry
          </button>
        )}
      </div>
    );
  }

  // Processing/Uploading state with progress bar
  const statusText = status === 'processing' ? 'Processing...' : 'Uploading...';

  return (
    <div
      className="p-3 bg-white rounded-lg border border-gray-200 shadow-sm"
      data-testid="upload-progress"
      data-status={status}
    >
      <div className="flex items-center gap-3">
        {/* Animated spinner */}
        <div
          className="w-8 h-8 rounded-full border-3 border-indigo-200 border-t-indigo-600 animate-spin flex-shrink-0"
          aria-hidden="true"
        />

        <div className="flex-1">
          <div className="flex justify-between text-sm mb-1">
            <span className="text-gray-600">{statusText}</span>
            <span className="text-indigo-600 font-medium">{Math.round(progress)}%</span>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-indigo-500 transition-all duration-200 ease-out"
              style={{ width: `${progress}%` }}
              role="progressbar"
              aria-valuenow={progress}
              aria-valuemin={0}
              aria-valuemax={100}
            />
          </div>
        </div>

        {onCancel && (
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 p-1"
            aria-label="Cancel upload"
            data-testid="cancel-button"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
};
