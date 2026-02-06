// apps/web/src/components/timer/MeterTimerInput.tsx
import { useState, useCallback } from 'react';
import type { MeterTimerInputProps, TimerPreset } from './types';

/**
 * Preset timer durations
 */
const PRESETS: TimerPreset[] = [
  { label: '30 min', minutes: 30 },
  { label: '1 hour', minutes: 60 },
  { label: '2 hours', minutes: 120 },
];

/**
 * Format a date for display
 */
const formatDateTime = (date: Date): string => {
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Calculate expiry time from minutes
 * Extracted to make it clear this is called in event handlers, not render
 */
const calculateExpiryTime = (minutes: number): string => {
  const expiresAt = new Date(Date.now() + minutes * 60 * 1000);
  return expiresAt.toISOString();
};

/**
 * Timer input component for setting meter expiry
 * Allows preset durations or custom minutes input
 */
export const MeterTimerInput = ({ value, onChange, disabled = false }: MeterTimerInputProps) => {
  const [customMinutes, setCustomMinutes] = useState('');

  const handlePreset = useCallback(
    (minutes: number) => {
      onChange(calculateExpiryTime(minutes));
    },
    [onChange]
  );

  const handleCustom = useCallback(() => {
    const minutes = parseInt(customMinutes, 10);
    if (minutes > 0 && minutes <= 1440) {
      onChange(calculateExpiryTime(minutes));
      setCustomMinutes('');
    }
  }, [customMinutes, onChange]);

  const handleClear = useCallback(() => {
    onChange(null);
    setCustomMinutes('');
  }, [onChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCustom();
    }
  };

  const currentValue = value ? new Date(value) : null;

  return (
    <div className="space-y-3" data-testid="meter-timer-input">
      <label className="text-sm font-medium text-gray-700">Meter Timer (optional)</label>

      {/* Presets */}
      <div className="flex gap-2">
        {PRESETS.map((preset) => (
          <button
            key={preset.minutes}
            type="button"
            onClick={() => handlePreset(preset.minutes)}
            disabled={disabled}
            className="px-4 py-2 rounded-lg border border-gray-300 text-sm font-medium 
                       hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
                       disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            data-testid={`preset-${preset.minutes}`}
          >
            {preset.label}
          </button>
        ))}
      </div>

      {/* Custom input */}
      <div className="flex gap-2">
        <input
          type="number"
          value={customMinutes}
          onChange={(e) => setCustomMinutes(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Custom minutes"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                     disabled:bg-gray-100 disabled:cursor-not-allowed"
          min="1"
          max="1440"
          disabled={disabled}
          data-testid="custom-minutes-input"
        />
        <button
          type="button"
          onClick={handleCustom}
          disabled={disabled || !customMinutes || parseInt(customMinutes, 10) <= 0}
          className="px-4 py-2 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium
                     hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1
                     disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          data-testid="set-custom-button"
        >
          Set
        </button>
      </div>

      {/* Current timer display */}
      {currentValue && (
        <div
          className="flex items-center justify-between bg-blue-50 p-3 rounded-lg"
          data-testid="timer-status"
        >
          <span className="text-sm text-blue-800">
            Timer set for {formatDateTime(currentValue)}
          </span>
          <button
            type="button"
            onClick={handleClear}
            disabled={disabled}
            className="text-red-500 text-sm font-medium hover:text-red-700 
                       focus:outline-none focus:underline disabled:opacity-50"
            data-testid="clear-timer-button"
          >
            Clear
          </button>
        </div>
      )}
    </div>
  );
};
