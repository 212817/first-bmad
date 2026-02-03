// apps/web/src/components/spot/CarTagSelector.tsx
import { useState, useRef, useEffect } from 'react';
import { useCarTagStore } from '@/stores/carTagStore';
import type { CarTagSelectorProps } from './carTag.types';

/**
 * Dropdown selector for car tags
 * Shows default tags first, then user's custom tags
 */
export const CarTagSelector = ({
  selectedTagId,
  onSelect,
  disabled = false,
}: CarTagSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { tags, isLoading } = useCarTagStore();

  // Find the currently selected tag, fallback to first tag (My Car)
  const currentTag = tags.find((t) => t.id === selectedTagId) || tags[0];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  if (isLoading || tags.length === 0) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 border border-gray-200 rounded-lg bg-gray-50">
        <span className="w-3 h-3 rounded-full bg-gray-300 animate-pulse" />
        <span className="text-gray-400 text-sm">Loading...</span>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={`
          flex items-center gap-2 px-3 py-2 
          border rounded-lg transition-all duration-200
          ${
            disabled
              ? 'bg-gray-100 border-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-white border-gray-300 hover:border-gray-400 cursor-pointer'
          }
        `}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        data-testid="car-tag-selector"
      >
        <span
          className="w-3 h-3 rounded-full shrink-0"
          style={{ backgroundColor: currentTag?.color || '#3B82F6' }}
          aria-hidden="true"
        />
        <span className="text-sm font-medium text-gray-700">{currentTag?.name || 'My Car'}</span>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div
          className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden"
          role="listbox"
          data-testid="car-tag-dropdown"
        >
          <div className="max-h-60 overflow-y-auto">
            {tags.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => {
                  onSelect(tag.id);
                  setIsOpen(false);
                }}
                className={`
                  w-full flex items-center gap-2 px-3 py-2.5 text-left
                  transition-colors duration-150
                  ${
                    tag.id === selectedTagId
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'hover:bg-gray-50 text-gray-700'
                  }
                `}
                role="option"
                aria-selected={tag.id === selectedTagId}
                data-testid={`car-tag-option-${tag.id}`}
              >
                <span
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: tag.color }}
                  aria-hidden="true"
                />
                <span className="text-sm flex-1">{tag.name}</span>
                {tag.id === selectedTagId && (
                  <svg
                    className="w-4 h-4 text-indigo-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                )}
                {tag.isDefault && (
                  <span className="text-xs text-gray-400 ml-auto">
                    {tag.id === selectedTagId ? '' : ''}
                  </span>
                )}
              </button>
            ))}
          </div>
          {/* Future: Add custom tag button */}
          <div className="border-t border-gray-100">
            <button
              type="button"
              className="w-full px-3 py-2.5 text-left text-sm text-gray-400 cursor-not-allowed"
              disabled
              title="Coming in Epic 5"
            >
              + Add custom tag
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
