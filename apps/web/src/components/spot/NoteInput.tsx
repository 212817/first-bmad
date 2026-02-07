// apps/web/src/components/spot/NoteInput.tsx
import { useRef, useEffect } from 'react';
import type { NoteInputProps } from './types';

/** Maximum note length */
const MAX_LENGTH = 200;

/** Placeholder examples */
const PLACEHOLDER = 'Add Note: P2, near elevator • Blue pillar';

/** Approximate characters per line (based on average font width) */
const CHARS_PER_LINE = 45;

/** Threshold to add new line (90% of line capacity) */
const LINE_THRESHOLD = 0.9;

/**
 * Calculate number of rows needed based on text length
 */
const calculateRows = (textLength: number): number => {
  if (textLength === 0) return 1;
  const charsForExpand = Math.floor(CHARS_PER_LINE * LINE_THRESHOLD);
  const rows = Math.ceil(textLength / charsForExpand);
  return Math.max(1, Math.min(rows, 8)); // Min 1, max 8 rows
};

/**
 * Note input component with textarea
 * Shows character counter and handles max length validation
 * Auto-expands based on content length
 */
export const NoteInput = ({ value, onChange, onSave, disabled = false }: NoteInputProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const remaining = MAX_LENGTH - value.length;
  const isAtLimit = remaining <= 0;
  const rows = calculateRows(value.length);

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

  // Scroll to bottom when rows increase
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.scrollTop = textareaRef.current.scrollHeight;
    }
  }, [rows]);

  return (
    <div data-testid="note-input">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onBlur={handleBlur}
        placeholder={PLACEHOLDER}
        disabled={disabled}
        rows={rows}
        maxLength={MAX_LENGTH}
        className={`
          w-full p-3 border-2 rounded-lg resize-none overflow-y-auto
          text-gray-900 placeholder-gray-400
          outline-none transition-all duration-150
          scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent
          ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-50' : 'bg-white'}
          ${isAtLimit ? 'border-red-500 ring-2 ring-red-200' : 'border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200'}
        `}
        style={{ scrollbarWidth: 'thin', scrollbarColor: '#d1d5db transparent' }}
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
