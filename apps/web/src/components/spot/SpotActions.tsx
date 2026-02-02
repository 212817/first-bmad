// apps/web/src/components/spot/SpotActions.tsx
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
}: ActionButtonProps) => {
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
      data-testid={`action-button-${label.toLowerCase()}`}
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
 * Provides quick access to add photo, note, tag, and timer
 */
export const SpotActions = ({
  spot,
  onPhotoClick,
  onNoteClick,
  onTagClick,
  onTimerClick,
}: SpotActionsProps) => {
  return (
    <div className="flex gap-3 py-2 overflow-x-auto scrollbar-hide" data-testid="spot-actions">
      {/* Photo Button */}
      <ActionButton
        icon="📷"
        label={spot.photoUrl ? 'Photo ✓' : 'Photo'}
        onClick={onPhotoClick}
        active={!!spot.photoUrl}
      />

      {/* Note Button */}
      <ActionButton
        icon="📝"
        label={spot.note ? 'Note ✓' : 'Note'}
        onClick={onNoteClick}
        active={!!spot.note}
      />

      {/* Car Tag Button */}
      <ActionButton icon="🚗" label="Tag" onClick={onTagClick} />

      {/* Timer Button - disabled placeholder for Epic 4 */}
      <ActionButton
        icon="⏱️"
        label="Timer"
        onClick={onTimerClick}
        disabled={true}
        tooltip="Coming soon"
      />
    </div>
  );
};
