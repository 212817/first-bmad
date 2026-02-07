// apps/web/src/components/spot/TagBadge.tsx
import type { TagBadgeProps } from './carTag.types';

/**
 * Badge component for displaying a hashtag
 * Shows # symbol and tag name with color styling
 */
export const TagBadge = ({ name, color, size = 'md' }: TagBadgeProps) => {
  const sizeClasses = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full font-medium ${sizeClasses}`}
      style={{
        backgroundColor: `${color}20`,
        color: color,
      }}
      data-testid="tag-badge"
    >
      <span className="font-black" aria-hidden="true">
        #
      </span>
      {name}
    </span>
  );
};
