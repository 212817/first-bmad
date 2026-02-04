// apps/web/src/components/spot/SpotSearchInput.tsx
import { useState, useEffect } from 'react';
import { useDebouncedCallback } from 'use-debounce';

import type { SpotSearchInputProps } from './types';

/**
 * Search input component with debounced onChange
 * Includes search icon and clear button
 */
export const SpotSearchInput = ({
  value,
  onChange,
  placeholder = 'Search spots...',
  autoFocus = false,
}: SpotSearchInputProps) => {
  const [localValue, setLocalValue] = useState(value);

  // Sync local value when external value changes
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const debouncedOnChange = useDebouncedCallback((val: string) => {
    onChange(val);
  }, 300);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    debouncedOnChange(newValue);
  };

  const handleClear = () => {
    setLocalValue('');
    onChange('');
  };

  return (
    <div className="relative flex-1" data-testid="spot-search-input">
      {/* Search icon */}
      <span
        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
        aria-hidden="true"
      >
        🔍
      </span>

      <input
        type="text"
        value={localValue}
        onChange={handleChange}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none transition-colors"
        aria-label="Search spots"
        data-testid="search-input"
      />

      {/* Clear button */}
      {localValue && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Clear search"
          data-testid="search-clear-button"
        >
          ✕
        </button>
      )}
    </div>
  );
};
