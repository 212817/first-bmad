// apps/web/src/components/prompts/LowAccuracyPrompt.tsx
import type { LowAccuracyPromptProps } from './types';

/**
 * Detect if running on iOS
 */
const isIOS = (): boolean => {
  if (typeof navigator === 'undefined') return false;
  return (
    /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
  );
};

/**
 * Prompt shown when location accuracy is too low (likely IP-based location)
 * Provides instructions for enabling Precise Location on iOS
 */
export const LowAccuracyPrompt = ({
  accuracy,
  onRetry,
  onContinue,
  onDismiss,
  isRetrying = false,
}: LowAccuracyPromptProps) => {
  const oniOS = isIOS();
  const accuracyKm = (accuracy / 1000).toFixed(1);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
        {/* Warning icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-amber-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">
          Low Location Accuracy
        </h2>

        <p className="text-gray-600 text-center mb-4 text-sm">
          Your location accuracy is ~{accuracyKm}km. This may place your parking spot in the wrong
          area.
        </p>

        {oniOS ? (
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <p className="text-sm font-medium text-blue-900 mb-2">
              📍 Enable Precise Location on iPhone:
            </p>
            <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
              <li>
                Open <strong>Settings</strong>
              </li>
              <li>
                Go to <strong>Privacy & Security</strong> → <strong>Location Services</strong>
              </li>
              <li>Find your browser (Chrome/Safari)</li>
              <li>
                Turn on <strong>Precise Location</strong>
              </li>
              <li>Return here and tap "Try Again"</li>
            </ol>
          </div>
        ) : (
          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> Make sure GPS/Location is enabled in your device settings for
              better accuracy.
            </p>
          </div>
        )}

        {/* Action buttons */}
        <div className="space-y-2">
          <button
            onClick={onRetry}
            disabled={isRetrying}
            className="w-full py-3 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
          >
            {isRetrying ? (
              <>
                <svg
                  className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Getting location...
              </>
            ) : (
              'Try Again'
            )}
          </button>

          <button
            onClick={onContinue}
            disabled={isRetrying}
            className="w-full py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            Continue Anyway
          </button>

          <button
            onClick={onDismiss}
            disabled={isRetrying}
            className="w-full py-2 text-gray-500 text-sm hover:text-gray-700 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
