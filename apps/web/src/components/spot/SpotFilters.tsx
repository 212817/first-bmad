// apps/web/src/components/spot/SpotFilters.tsx
import { useState, useRef, useEffect } from 'react';

import { useCarTagStore } from '@/stores/carTagStore';
import type { SpotFiltersProps } from './types';

/**
 * Filter dropdown for spot history
 * Allows filtering by car tag
 */
export const SpotFilters = ({ selectedTagId, onTagChange }: SpotFiltersProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { tags } = useCarTagStore();

  // Close dropdown on outside click
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

  const handleTagSelect = (tagId: string | undefined) => {
    onTagChange(tagId);
    setIsOpen(false);
  };

  // Find the selected tag by ID to display its name
  const selectedTag = selectedTagId ? tags.find((t) => t.id === selectedTagId) : null;

  return (
    <div className="relative" ref={dropdownRef} data-testid="spot-filters">
      {/* Filter button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 border rounded-lg hover:bg-gray-50 transition-colors ${
          selectedTag ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300'
        }`}
        aria-label="Filter by car tag"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        data-testid="filter-button"
      >
        <span aria-hidden="true">🏷️</span>
        <span className="text-sm">{selectedTag?.name || 'All tags'}</span>
        <span aria-hidden="true" className="text-gray-400">
          ▼
        </span>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className="absolute top-full mt-1 right-0 bg-white border border-gray-200 rounded-lg shadow-lg min-w-[160px] z-20 py-1"
          role="listbox"
          aria-label="Car tag filter options"
          data-testid="filter-dropdown"
        >
          {/* All tags option */}
          <button
            type="button"
            onClick={() => handleTagSelect(undefined)}
            className={`w-full px-4 py-2 text-left hover:bg-gray-50 text-sm ${
              !selectedTagId ? 'bg-gray-100 font-medium' : ''
            }`}
            role="option"
            aria-selected={!selectedTagId}
            data-testid="filter-option-all"
          >
            All tags
          </button>

          {/* Tag options */}
          {tags.map((tag) => (
            <button
              key={tag.id}
              type="button"
              onClick={() => handleTagSelect(tag.id)}
              className={`w-full px-4 py-2 text-left hover:bg-gray-50 text-sm flex items-center gap-2 ${
                selectedTagId === tag.id ? 'bg-gray-100 font-medium' : ''
              }`}
              role="option"
              aria-selected={selectedTagId === tag.id}
              data-testid={`filter-option-${tag.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: tag.color }}
                aria-hidden="true"
              />
              {tag.name}
            </button>
          ))}
        </div>
      )}

      {/* Active filter indicator */}
      {selectedTag && (
        <span
          className="absolute -top-1 -right-1 w-3 h-3 rounded-full"
          style={{ backgroundColor: selectedTag.color }}
          aria-hidden="true"
        />
      )}
    </div>
  );
};
