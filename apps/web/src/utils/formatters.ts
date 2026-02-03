// apps/web/src/utils/formatters.ts

/**
 * Time units in milliseconds
 */
const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const WEEK = 7 * DAY;
const MONTH = 30 * DAY;
const YEAR = 365 * DAY;

/**
 * Format a date/timestamp to a relative time string
 * Examples: "just now", "5 minutes ago", "2 hours ago", "3 days ago"
 */
export const formatRelativeTime = (date: Date | string): string => {
  const now = new Date();
  const target = typeof date === 'string' ? new Date(date) : date;
  const diff = now.getTime() - target.getTime();

  if (diff < MINUTE) {
    return 'just now';
  }

  if (diff < HOUR) {
    const minutes = Math.floor(diff / MINUTE);
    return `${minutes}m ago`;
  }

  if (diff < DAY) {
    const hours = Math.floor(diff / HOUR);
    return `${hours}h ago`;
  }

  if (diff < WEEK) {
    const days = Math.floor(diff / DAY);
    return `${days}d ago`;
  }

  if (diff < MONTH) {
    const weeks = Math.floor(diff / WEEK);
    return `${weeks}w ago`;
  }

  if (diff < YEAR) {
    const months = Math.floor(diff / MONTH);
    return `${months}mo ago`;
  }

  const years = Math.floor(diff / YEAR);
  return `${years}y ago`;
};

/**
 * Format coordinates to human-readable string
 * e.g., "40.7128°N, 74.0060°W"
 */
export const formatCoordinates = (lat: number, lng: number): string => {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}°${latDir}, ${Math.abs(lng).toFixed(4)}°${lngDir}`;
};

/**
 * Format a date/timestamp to human-readable date and time
 * Example: "Jan 15, 2026 at 3:45 PM"
 */
export const formatDateTime = (date: Date | string): string => {
  const target = typeof date === 'string' ? new Date(date) : date;

  return (
    target.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }) +
    ' at ' +
    target.toLocaleTimeString(undefined, {
      hour: 'numeric',
      minute: '2-digit',
    })
  );
};
