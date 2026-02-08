// apps/web/src/components/spot/CarTagSelector.tsx
import { useState, useRef, useEffect } from 'react';
import { useCarTagStore } from '@/stores/carTagStore';
import { useGuestStore } from '@/stores/guestStore';
import type { CarTagSelectorProps } from './carTag.types';

// Predefined color options for custom tags
const COLOR_OPTIONS = [
  { color: '#3B82F6', name: 'Blue' },
  { color: '#10B981', name: 'Green' },
  { color: '#F59E0B', name: 'Orange' },
  { color: '#EF4444', name: 'Red' },
  { color: '#8B5CF6', name: 'Purple' },
  { color: '#EC4899', name: 'Pink' },
  { color: '#6B7280', name: 'Gray' },
];

/**
 * Dropdown selector for car tags
 * Shows custom tags first, then default tags
 * Authenticated users can add custom tags
 */
export const CarTagSelector = ({
  selectedTagId,
  onSelect,
  disabled = false,
}: CarTagSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newTagName, setNewTagName] = useState('');
  const [newTagColor, setNewTagColor] = useState(COLOR_OPTIONS[0]?.color ?? '#3B82F6');
  const [isCreating, setIsCreating] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { tags, isLoading, createTag } = useCarTagStore();
  const isGuest = useGuestStore((state) => state.isGuest);

  // Sort tags: custom tags first, then "My Car", then other defaults
  const sortedTags = [...tags].sort((a, b) => {
    // Custom tags first
    if (!a.isDefault && b.isDefault) return -1;
    if (a.isDefault && !b.isDefault) return 1;
    // Among defaults, "My Car" comes first
    if (a.isDefault && b.isDefault) {
      if (a.name === 'My Car') return -1;
      if (b.name === 'My Car') return 1;
    }
    return 0;
  });

  // Get preferred default tag: first custom tag, or "My Car", or first available
  const getPreferredTag = () => {
    const customTags = sortedTags.filter((t) => !t.isDefault);
    if (customTags.length > 0) return customTags[0];
    return sortedTags.find((t) => t.name === 'My Car') || sortedTags[0];
  };
  const preferredTag = getPreferredTag();

  // Find the currently selected tag, fallback to preferred tag
  const currentTag = sortedTags.find((t) => t.id === selectedTagId) || preferredTag;

  // Auto-select preferred tag only if no selection is set
  useEffect(() => {
    if (!isLoading && preferredTag) {
      const currentSelected = tags.find((t) => t.id === selectedTagId);
      if (!currentSelected) {
        // No selection - auto-select preferred tag
        onSelect(preferredTag.id);
      }
    }
  }, [isLoading, preferredTag, selectedTagId, tags, onSelect]);

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
      setShowAddForm(false);
    } else if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      setIsOpen(!isOpen);
    }
  };

  // Focus input when showing add form
  useEffect(() => {
    if (showAddForm && inputRef.current) {
      inputRef.current.focus();
    }
  }, [showAddForm]);

  // Handle creating a new custom tag
  const handleCreateTag = async () => {
    const trimmedName = newTagName.trim();
    if (!trimmedName || isCreating) return;

    setIsCreating(true);
    try {
      const newTag = await createTag(trimmedName, newTagColor);
      onSelect(newTag.id);
      setNewTagName('');
      setNewTagColor(COLOR_OPTIONS[0]?.color ?? '#3B82F6');
      setShowAddForm(false);
      setIsOpen(false);
    } catch {
      // Error handled by store
    } finally {
      setIsCreating(false);
    }
  };

  // Handle canceling add form
  const handleCancelAdd = () => {
    setShowAddForm(false);
    setNewTagName('');
    setNewTagColor(COLOR_OPTIONS[0]?.color ?? '#3B82F6');
  };

  if (isLoading) {
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
          style={{ backgroundColor: currentTag?.color || '#8B5CF6' }}
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
          className="absolute top-full left-0 mt-1 w-max bg-white border border-gray-200 rounded-lg shadow-lg z-[500] overflow-hidden"
          role="listbox"
          data-testid="car-tag-dropdown"
        >
          <div className="max-h-60 overflow-y-auto">
            {sortedTags
              .filter((tag) => tag.id !== selectedTagId)
              .map((tag) => (
                <button
                  key={tag.id}
                  type="button"
                  onClick={() => {
                    onSelect(tag.id);
                    setIsOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-left transition-colors duration-150 hover:bg-gray-50 text-gray-700"
                  role="option"
                  aria-selected={false}
                  data-testid={`car-tag-option-${tag.id}`}
                >
                  {/* Color circle */}
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: tag.color }}
                    aria-hidden="true"
                  />
                  {/* Name */}
                  <span className="text-sm whitespace-nowrap">{tag.name}</span>
                </button>
              ))}
          </div>

          {/* Add custom tag section */}
          <div className="border-t border-gray-100">
            {isGuest ? (
              // Guest mode: disabled with tooltip
              <button
                type="button"
                className="w-full px-3 py-2.5 text-left text-sm text-gray-400 cursor-not-allowed"
                disabled
                title="Sign in to add tags"
                data-testid="add-tag-disabled"
              >
                + Add tag
              </button>
            ) : showAddForm ? (
              // Authenticated: show add form
              <div className="p-3 space-y-3" data-testid="add-tag-form">
                <input
                  ref={inputRef}
                  type="text"
                  value={newTagName}
                  onChange={(e) => setNewTagName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleCreateTag();
                    } else if (e.key === 'Escape') {
                      handleCancelAdd();
                    }
                  }}
                  placeholder="Tag name"
                  maxLength={20}
                  className="w-full px-2 py-1.5 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  data-testid="add-tag-input"
                />
                <div className="flex gap-1.5 flex-wrap">
                  {COLOR_OPTIONS.map((opt) => (
                    <button
                      key={opt.color}
                      type="button"
                      onClick={() => setNewTagColor(opt.color)}
                      className={`w-6 h-6 rounded-full transition-all ${
                        newTagColor === opt.color
                          ? 'ring-2 ring-offset-1 ring-indigo-500 scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: opt.color }}
                      title={opt.name}
                      aria-label={`Select ${opt.name} color`}
                      data-testid={`color-option-${opt.name.toLowerCase()}`}
                    />
                  ))}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handleCancelAdd}
                    className="flex-1 px-2 py-1.5 text-sm text-gray-600 bg-gray-100 rounded hover:bg-gray-200 transition-colors"
                    data-testid="cancel-add-tag"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleCreateTag}
                    disabled={!newTagName.trim() || isCreating}
                    className="flex-1 px-2 py-1.5 text-sm text-white bg-indigo-600 rounded hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                    data-testid="save-add-tag"
                  >
                    {isCreating ? 'Saving...' : 'Save'}
                  </button>
                </div>
              </div>
            ) : (
              // Authenticated: show add button
              <button
                type="button"
                onClick={() => setShowAddForm(true)}
                className="w-full px-3 py-2.5 text-left text-sm text-indigo-600 hover:bg-indigo-50 transition-colors"
                data-testid="add-tag-button"
              >
                + Add tag
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
