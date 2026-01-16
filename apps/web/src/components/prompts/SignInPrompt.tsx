// apps/web/src/components/prompts/SignInPrompt.tsx
import type { SignInPromptProps } from './types';

/**
 * Non-blocking prompt encouraging guest users to sign in
 * Displays benefits of signing in (sync across devices)
 */
export const SignInPrompt = ({ onSignIn, onDismiss }: SignInPromptProps) => {
  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 bg-white rounded-lg shadow-xl border border-gray-200 p-4 z-50">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
          <svg
            className="w-5 h-5 text-indigo-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900">Sync your spots</h3>
          <p className="text-sm text-gray-600 mt-1">
            Sign in to sync your parking spots across all your devices.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={onSignIn}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-md transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={onDismiss}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 text-sm font-medium transition-colors"
            >
              Maybe later
            </button>
          </div>
        </div>
        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Dismiss"
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
};
