// apps/web/src/components/timer/types.ts

/**
 * Props for MeterTimerInput component
 */
export interface MeterTimerInputProps {
  /** Current expiry date (ISO string) */
  value?: string | null;
  /** Callback when expiry date changes */
  onChange: (expiresAt: string | null) => void;
  /** Whether the input is disabled */
  disabled?: boolean;
}

/**
 * Preset timer duration option
 */
export interface TimerPreset {
  label: string;
  minutes: number;
}

/**
 * Props for MeterTimerDisplay component
 */
export interface MeterTimerDisplayProps {
  /** Expiry date (ISO string) */
  expiresAt: string;
  /** Display size */
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Time left calculation result
 */
export interface TimeLeft {
  totalMinutes: number;
  hours: number;
  minutes: number;
  seconds: number;
}
