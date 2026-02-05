// apps/web/src/components/spot/NoteInput.tsx
import type { NoteInputProps } from './types';

/** Maximum note length */
const MAX_LENGTH = 500;

/** Placeholder examples */
const PLACEHOLDER = 'Add Note: P2, near elevator • Blue pillar • Row G';

/**
 * Note input component with textarea
 * Shows character counter and handles max length validation
 */
export const NoteInput = ({ value, onChange, onSave, disabled = false }: NoteInputProps) => {
  const remaining = MAX_LENGTH - value.length;
  const isAtLimit = remaining <= 0;

  /**
   * Handle text change with max length enforcement
   */
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value.slice(0, MAX_LENGTH);
    onChange(newValue);
  };

  /**
   * Handle blur - save if value exists
   */
  const handleBlur = () => {
    if (value.trim()) {
      onSave();
    }
  };

  return (
    <div data-testid="note-input">
      <textarea
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={PLACEHOLDER}
        disabled={disabled}
        rows={3}
        maxLength={MAX_LENGTH}
        className={`
          w-full p-3 border rounded-lg resize-none
          text-gray-900 placeholder-gray-400
          focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
          ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-50' : 'bg-white'}
          ${isAtLimit ? 'border-red-300' : 'border-gray-200'}
        `}
        data-testid="note-input-textarea"
      />
      {/* Show counter only when at limit */}
      {isAtLimit && (
        <div className="text-xs text-right text-red-500 mt-0.5" data-testid="note-input-counter">
          {value.length}/{MAX_LENGTH}
        </div>
      )}
    </div>
  );
};
