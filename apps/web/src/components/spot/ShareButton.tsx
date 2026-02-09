// apps/web/src/components/spot/ShareButton.tsx
import { useState } from 'react';
import { useSpotStore } from '@/stores/spotStore';
import { useGuestStore } from '@/stores/guestStore';
import { shareService } from '@/services/share/share.service';
import type { ShareButtonProps } from './types';

/**
 * ShareButton component for creating and sharing spot links
 * Uses Web Share API when available, falls back to clipboard
 * Disabled for guest users (sharing requires authentication)
 */
export const ShareButton = ({
  spotId,
  spotAddress,
  variant = 'secondary',
  className = '',
}: ShareButtonProps) => {
  const [isSharing, setIsSharing] = useState(false);
  const [showCopied, setShowCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const { createShareLink } = useSpotStore();
  const { isGuest } = useGuestStore();

  const handleShare = async () => {
    if (isGuest) return;

    setIsSharing(true);
    setError(null);
    setShowErrorModal(false);

    try {
      const { shareUrl } = await createShareLink(spotId);
      const title = spotAddress || 'My Parking Spot';

      const shared = await shareService.shareSpot(shareUrl, title);

      if (!shared) {
        // Web Share not available or cancelled - copy to clipboard
        await shareService.copyToClipboard(shareUrl);
        setShowCopied(true);
        setTimeout(() => setShowCopied(false), 2000);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create share link';
      setError(message);
      setShowErrorModal(true);
    } finally {
      setIsSharing(false);
    }
  };

  const handleCloseError = () => {
    setShowErrorModal(false);
    setError(null);
  };

  const isDisabled = isSharing || isGuest;

  const baseStyles = `
    inline-flex items-center justify-center gap-2
    font-medium rounded-lg transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variantStyles = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-2.5',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 px-4 py-2.5',
    icon: 'bg-white text-gray-600 hover:text-indigo-600 hover:bg-gray-50 p-2 border border-gray-200',
  };

  const buttonLabel = showCopied ? 'Copied!' : isSharing ? 'Sharing...' : 'Share';
  const buttonTitle = isGuest ? 'Sign in to share spots' : undefined;

  return (
    <>
      <button
        onClick={handleShare}
        disabled={isDisabled}
        className={`${baseStyles} ${variantStyles[variant]} ${className}`}
        data-testid="share-button"
        title={buttonTitle}
      >
        {/* Share icon */}
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
        {variant !== 'icon' && <span>{buttonLabel}</span>}
      </button>

      {/* Error Modal */}
      {showErrorModal && error && (
        <div
          className="fixed inset-0 z-[9999] bg-black/50 flex items-center justify-center p-4"
          onClick={handleCloseError}
          role="dialog"
          aria-modal="true"
          aria-labelledby="share-error-title"
          data-testid="share-error-modal"
        >
          <div
            className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start gap-3">
              {/* Error icon */}
              <div className="shrink-0 w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <svg
                  className="w-5 h-5 text-red-600"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <h3 id="share-error-title" className="text-lg font-semibold text-gray-900">
                  Share Error
                </h3>
                <p className="mt-2 text-sm text-gray-600 break-words whitespace-pre-wrap">
                  {error}
                </p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleCloseError}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-medium hover:bg-gray-200 transition-colors"
                data-testid="share-error-close"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
