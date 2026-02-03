// apps/web/src/components/spot/TagBadge.tsx
import type { TagBadgeProps } from './carTag.types';

/**
 * Badge component for displaying a car tag
 * Shows colored dot and tag name
 */
export const TagBadge = ({ name, color, size = 'md' }: TagBadgeProps) => {
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';
  const dotSize = size === 'sm' ? 'w-2 h-2' : 'w-2.5 h-2.5';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses}`}
      style={{
        backgroundColor: `${color}20`,
        color: color,
      }}
      data-testid="tag-badge"
    >
      <span
        className={`${dotSize} rounded-full shrink-0`}
        style={{ backgroundColor: color }}
        aria-hidden="true"
      />
      {name}
    </span>
  );
};
