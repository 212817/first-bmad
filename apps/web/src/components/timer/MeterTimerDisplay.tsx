// apps/web/src/components/timer/MeterTimerDisplay.tsx
import { useState, useEffect } from 'react';
import type { MeterTimerDisplayProps, TimeLeft } from './types';

/**
 * Calculate time remaining until expiry
 */
const calculateTimeLeft = (expiresAt: string): TimeLeft => {
  const diff = new Date(expiresAt).getTime() - Date.now();
  const totalSeconds = Math.floor(diff / 1000);
  const totalMinutes = Math.floor(totalSeconds / 60);
  const hours = Math.floor(Math.abs(totalMinutes) / 60);
  const minutes = Math.abs(totalMinutes) % 60;
  const seconds = Math.abs(totalSeconds) % 60;
  return { totalMinutes, hours, minutes, seconds };
};

/**
 * Format time left for display (with seconds)
 */
const formatTimeLeft = ({
  hours,
  minutes,
  seconds,
}: {
  hours: number;
  minutes: number;
  seconds: number;
}): string => {
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`;
  }
  return `${minutes}m ${seconds}s`;
};

/**
 * Clock icon SVG component
 */
const ClockIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
    aria-hidden="true"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

/**
 * Meter timer display component
 * Shows countdown with color-coded urgency
 */
export const MeterTimerDisplay = ({ expiresAt, size = 'md' }: MeterTimerDisplayProps) => {
  // Use a counter to trigger re-renders every minute
  const [tick, setTick] = useState(0);

  useEffect(() => {
    // Update every second to refresh the countdown
    const interval = setInterval(() => {
      setTick((t) => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Calculate time left on each render (including after tick updates)
  // The tick state change triggers re-render, which recalculates the time
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const _tick = tick; // Reference tick to ensure it's used
  const timeLeft: TimeLeft = calculateTimeLeft(expiresAt);

  const isExpired = timeLeft.totalMinutes <= 0;
  const isUrgent = timeLeft.totalMinutes > 0 && timeLeft.totalMinutes <= 10;
  const isWarning = timeLeft.totalMinutes > 10 && timeLeft.totalMinutes <= 30;

  // Color coding: red for expired/urgent, yellow for warning, green for safe
  const colorClass =
    isExpired || isUrgent
      ? 'text-red-600 bg-red-50'
      : isWarning
        ? 'text-yellow-600 bg-yellow-50'
        : 'text-green-600 bg-green-50';

  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  };

  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full font-medium ${colorClass} ${sizeClasses[size]}`}
      data-testid="meter-timer-display"
      aria-label={isExpired ? 'Meter expired' : `${formatTimeLeft(timeLeft)} remaining`}
    >
      <ClockIcon className={iconSizes[size]} />
      <span data-testid="timer-text">{isExpired ? 'Expired' : formatTimeLeft(timeLeft)}</span>
    </div>
  );
};
