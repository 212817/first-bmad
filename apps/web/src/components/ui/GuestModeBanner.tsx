// apps/web/src/components/ui/GuestModeBanner.tsx

interface GuestModeBannerProps {
  onSignInClick?: () => void;
}

/**
 * Banner displayed when user is in guest mode
 * Shows warning about local-only storage
 */
export const GuestModeBanner = ({ onSignInClick }: GuestModeBannerProps) => {
  const handleSignInClick = () => {
    if (onSignInClick) {
      onSignInClick();
    } else {
      window.location.href = '/login';
    }
  };

  return (
    <div className="sticky top-0 z-[1001] bg-amber-50 border-b border-amber-200 px-4 py-2">
      <div className="flex items-center justify-center gap-2 text-amber-800 text-sm">
        <svg
          className="w-4 h-4 flex-shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <span>Guest Mode - Some features are limited</span>
        <button
          onClick={handleSignInClick}
          className="ml-2 underline hover:text-amber-900 transition-colors"
        >
          Sign in
        </button>
      </div>
    </div>
  );
};
