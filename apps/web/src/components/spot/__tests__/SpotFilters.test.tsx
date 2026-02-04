// apps/web/src/components/spot/__tests__/SpotFilters.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SpotFilters } from '../SpotFilters';
import { useCarTagStore } from '@/stores/carTagStore';

// Mock the store
vi.mock('@/stores/carTagStore');

describe('SpotFilters', () => {
  const mockOnTagChange = vi.fn();
  const mockTags = [
    { id: 'tag-1', name: 'Work', color: '#3B82F6', isDefault: false },
    { id: 'tag-2', name: 'Personal', color: '#10B981', isDefault: false },
    { id: 'tag-3', name: 'Rental', color: '#F59E0B', isDefault: true },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCarTagStore).mockReturnValue({
      tags: mockTags,
      isLoading: false,
      error: null,
      isHydrated: true,
      fetchTags: vi.fn(),
      createTag: vi.fn(),
      updateTag: vi.fn(),
      deleteTag: vi.fn(),
      getTagById: vi.fn(),
      setError: vi.fn(),
    });
  });

  it('should render filter button', () => {
    render(<SpotFilters selectedTagId={undefined} onTagChange={mockOnTagChange} />);
    expect(screen.getByTestId('filter-button')).toBeInTheDocument();
  });

  it('should show "All tags" when no tag selected', () => {
    render(<SpotFilters selectedTagId={undefined} onTagChange={mockOnTagChange} />);
    expect(screen.getByText('All tags')).toBeInTheDocument();
  });

  it('should show selected tag name when tag is selected', () => {
    // Pass ID 'tag-1' for 'Work'
    render(<SpotFilters selectedTagId="tag-1" onTagChange={mockOnTagChange} />);
    expect(screen.getByText('Work')).toBeInTheDocument();
  });

  it('should open dropdown on click', () => {
    render(<SpotFilters selectedTagId={undefined} onTagChange={mockOnTagChange} />);

    fireEvent.click(screen.getByTestId('filter-button'));

    expect(screen.getByTestId('filter-dropdown')).toBeInTheDocument();
    expect(screen.getByTestId('filter-option-all')).toBeInTheDocument();
  });

  it('should show all tags in dropdown', () => {
    render(<SpotFilters selectedTagId={undefined} onTagChange={mockOnTagChange} />);

    fireEvent.click(screen.getByTestId('filter-button'));

    expect(screen.getByTestId('filter-option-work')).toBeInTheDocument();
    expect(screen.getByTestId('filter-option-personal')).toBeInTheDocument();
    expect(screen.getByTestId('filter-option-rental')).toBeInTheDocument();
  });

  it('should call onTagChange with tag ID when tag selected', () => {
    render(<SpotFilters selectedTagId={undefined} onTagChange={mockOnTagChange} />);

    fireEvent.click(screen.getByTestId('filter-button'));
    fireEvent.click(screen.getByTestId('filter-option-work'));

    expect(mockOnTagChange).toHaveBeenCalledWith('tag-1');
  });

  it('should call onTagChange with undefined when "All tags" selected', () => {
    render(<SpotFilters selectedTagId="tag-1" onTagChange={mockOnTagChange} />);

    fireEvent.click(screen.getByTestId('filter-button'));
    fireEvent.click(screen.getByTestId('filter-option-all'));

    expect(mockOnTagChange).toHaveBeenCalledWith(undefined);
  });

  it('should close dropdown after selection', () => {
    render(<SpotFilters selectedTagId={undefined} onTagChange={mockOnTagChange} />);

    fireEvent.click(screen.getByTestId('filter-button'));
    expect(screen.getByTestId('filter-dropdown')).toBeInTheDocument();

    fireEvent.click(screen.getByTestId('filter-option-work'));
    expect(screen.queryByTestId('filter-dropdown')).not.toBeInTheDocument();
  });

  it('should have highlighted style when tag is selected', () => {
    render(<SpotFilters selectedTagId="tag-1" onTagChange={mockOnTagChange} />);

    const button = screen.getByTestId('filter-button');
    expect(button.className).toContain('border-indigo-500');
  });

  it('should be accessible with aria attributes', () => {
    render(<SpotFilters selectedTagId={undefined} onTagChange={mockOnTagChange} />);

    const button = screen.getByTestId('filter-button');
    expect(button).toHaveAttribute('aria-haspopup', 'listbox');
    expect(button).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-expanded', 'true');
  });
});
