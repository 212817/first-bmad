// apps/web/src/pages/SpotConfirmationPage.tsx
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useSpotStore } from '@/stores/spotStore';
import { SpotDetailCard } from '@/components/spot/SpotDetailCard';
import { SpotActions } from '@/components/spot/SpotActions';

/**
 * Confirmation page displayed after successfully saving a parking spot.
 * Shows spot details and allows adding optional info (photo, note, tag).
 */
export const SpotConfirmationPage = () => {
  const { spotId } = useParams<{ spotId: string }>();
  const navigate = useNavigate();
  const { currentSpot } = useSpotStore();
  const [showSuccess, setShowSuccess] = useState(true);

  // If no spot data, redirect to home
  useEffect(() => {
    if (!currentSpot && !spotId) {
      navigate('/', { replace: true });
    }
  }, [currentSpot, spotId, navigate]);

  // Hide success animation after delay
  useEffect(() => {
    const timer = setTimeout(() => setShowSuccess(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  /**
   * Handle Done button - return to home screen
   */
  const handleDone = () => {
    navigate('/', { replace: true });
  };

  /**
   * Handle Navigate Now button - placeholder for Epic 3
   */
  const handleNavigate = () => {
    // TODO: Epic 3 - Open maps navigation
    console.log('Navigate - Coming in Epic 3');
  };

  /**
   * Handle Photo action button click
   */
  const handlePhotoClick = () => {
    // TODO: Story 2.3 - Camera capture
    console.log('Add Photo - Coming in Story 2.3');
  };

  /**
   * Handle Note action button click
   */
  const handleNoteClick = () => {
    // TODO: Story 2.5 - Add note
    console.log('Add Note - Coming in Story 2.5');
  };

  /**
   * Handle Tag action button click
   */
  const handleTagClick = () => {
    // TODO: Story 2.7 - Car tag selector
    console.log('Set Tag - Coming in Story 2.7');
  };

  /**
   * Handle Timer action button click
   */
  const handleTimerClick = () => {
    // TODO: Epic 4 - Timer functionality
    console.log('Set Timer - Coming in Epic 4');
  };

  // Show loading if no spot available
  if (!currentSpot) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-indigo-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col"
      data-testid="spot-confirmation-page"
    >
      {/* Success Header */}
      <div className="text-center py-8">
        <div
          className={`text-5xl mb-3 transition-all duration-500 ${showSuccess ? 'animate-bounce' : ''}`}
          aria-hidden="true"
        >
          ✓
        </div>
        <h1 className="text-2xl font-bold text-indigo-900">Spot Saved!</h1>
      </div>

      {/* Main Content */}
      <main className="flex-1 px-4 pb-4 flex flex-col">
        {/* Spot Details Card */}
        <SpotDetailCard spot={currentSpot} />

        {/* Action Buttons */}
        <div className="mt-6">
          <SpotActions
            spot={currentSpot}
            onPhotoClick={handlePhotoClick}
            onNoteClick={handleNoteClick}
            onTagClick={handleTagClick}
            onTimerClick={handleTimerClick}
          />
        </div>

        {/* Navigation Buttons */}
        <div className="mt-auto pt-6 space-y-3">
          <button
            onClick={handleNavigate}
            className="w-full h-12 border-2 border-indigo-500 text-indigo-600 rounded-lg font-medium hover:bg-indigo-50 transition-colors"
            data-testid="navigate-button"
          >
            Navigate Now
          </button>
          <button
            onClick={handleDone}
            className="w-full h-12 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors"
            data-testid="done-button"
          >
            Done
          </button>
        </div>
      </main>
    </div>
  );
};
