// apps/web/src/components/spot/SpotActions.tsx
import { isMobile } from '@/utils/platform';
import type { SpotActionsProps, ActionButtonProps } from './types';

/**
 * Individual action button component
 */
const ActionButton = ({
  icon,
  label,
  onClick,
  active = false,
  disabled = false,
  tooltip,
  testId,
}: ActionButtonProps & { testId?: string }) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={tooltip}
      className={`
        flex flex-col items-center justify-center
        min-w-[72px] h-20 p-2 rounded-xl
        transition-all duration-200
        ${
          disabled
            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
            : active
              ? 'bg-indigo-100 text-indigo-700 border-2 border-indigo-300'
              : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50 hover:border-gray-300'
        }
      `}
      data-testid={testId ?? `action-button-${label.toLowerCase().replace(/\s+/g, '-')}`}
    >
      <span className="text-2xl mb-1" aria-hidden="true">
        {icon}
      </span>
      <span className="text-xs font-medium truncate max-w-full">{label}</span>
    </button>
  );
};

/**
 * Action buttons section for spot confirmation page
 * Provides quick access to add photo, gallery, note, tag, and timer
 */
export const SpotActions = ({
  spot,
  onPhotoClick,
  onGalleryClick,
  onTimerClick,
}: SpotActionsProps) => {
  // On mobile, gallery picker already offers camera option, so hide dedicated camera button
  const isMobileDevice = isMobile();
  const showCameraButton = !isMobileDevice;

  // On mobile, show camera icon and "Add Photo" label since gallery offers both options
  const galleryIcon = isMobileDevice ? '📷' : '🖼️';
  // Use unique labels to avoid duplicate test IDs
  const cameraLabel = spot.photoUrl ? 'Retake' : 'Camera';
  const galleryLabel = spot.photoUrl ? 'Photo ✓' : isMobileDevice ? 'Add Photo' : 'Gallery';

  return (
    <div className="flex gap-3 pt-0 pb-2 overflow-x-auto scrollbar-hide" data-testid="spot-actions">
      {/* Camera Photo Button - hidden on mobile (gallery has camera option) */}
      {showCameraButton && (
        <ActionButton
          icon="📷"
          label={cameraLabel}
          onClick={onPhotoClick}
          active={!!spot.photoUrl}
        />
      )}

      {/* Gallery Upload Button */}
      <ActionButton
        icon={galleryIcon}
        label={galleryLabel}
        onClick={onGalleryClick}
        active={!!spot.photoUrl}
      />

      {/* Timer Button */}
      <ActionButton
        icon="⏱️"
        label={spot.meterExpiresAt ? 'Timer ✓' : 'Timer'}
        onClick={onTimerClick}
        active={!!spot.meterExpiresAt}
        testId="action-button-timer"
      />
    </div>
  );
};
