// apps/web/src/components/prompts/LocationPermissionPrompt.tsx
import type { LocationPermissionPromptProps } from './types';

/**
 * Prompt explaining why location permission is needed
 * Displays before browser's native permission dialog
 */
export const LocationPermissionPrompt = ({
  onEnableLocation,
  onEnterManually,
  isLoading = false,
}: LocationPermissionPromptProps) => {
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6">
        {/* Location icon */}
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center">
            <svg
              className="w-8 h-8 text-indigo-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
              />
            </svg>
          </div>
        </div>

        {/* Title and description */}
        <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">Enable Location</h2>
        <p className="text-gray-600 text-center mb-6">
          We need your location to save where you parked. Your location is only used when you tap
          &quot;Save my spot&quot; and is never shared.
        </p>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={onEnableLocation}
            disabled={isLoading}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
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
              'Enable Location'
            )}
          </button>
          <button
            onClick={onEnterManually}
            disabled={isLoading}
            className="w-full py-3 px-4 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Enter address manually
          </button>
        </div>
      </div>
    </div>
  );
};
