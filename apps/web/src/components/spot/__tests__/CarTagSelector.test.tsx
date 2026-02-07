// apps/web/src/components/spot/__tests__/CarTagSelector.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CarTagSelector } from '../CarTagSelector';
import { useCarTagStore } from '@/stores/carTagStore';
import { useGuestStore } from '@/stores/guestStore';

// Mock stores
vi.mock('@/stores/carTagStore', () => ({
  useCarTagStore: vi.fn(),
}));

vi.mock('@/stores/guestStore', () => ({
  useGuestStore: vi.fn(),
}));

const mockTags = [
  { id: 'tag-1', name: 'Home', color: '#3B82F6', isDefault: true },
  { id: 'tag-2', name: 'Work', color: '#10B981', isDefault: true },
  { id: 'tag-3', name: 'Custom Tag', color: '#EF4444', isDefault: false },
];

describe('CarTagSelector', () => {
  const mockOnSelect = vi.fn();
  const mockCreateTag = vi.fn();

  beforeEach(() => {
    vi.mocked(useCarTagStore).mockReturnValue({
      tags: mockTags,
      isLoading: false,
      createTag: mockCreateTag,
    } as ReturnType<typeof useCarTagStore>);

    vi.mocked(useGuestStore).mockImplementation((selector) => {
      const state = { isGuest: false };
      return selector ? selector(state as never) : state;
    });

    mockOnSelect.mockClear();
    mockCreateTag.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render loading state', () => {
      vi.mocked(useCarTagStore).mockReturnValue({
        tags: mockTags,
        isLoading: true,
        createTag: mockCreateTag,
      } as ReturnType<typeof useCarTagStore>);

      render(<CarTagSelector selectedTagId="tag-1" onSelect={mockOnSelect} />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });

    it('should render with selected tag', () => {
      render(<CarTagSelector selectedTagId="tag-1" onSelect={mockOnSelect} />);

      expect(screen.getByTestId('car-tag-selector')).toBeInTheDocument();
      expect(screen.getByText('Home')).toBeInTheDocument();
    });

    it('should open dropdown on click', async () => {
      render(<CarTagSelector selectedTagId="tag-1" onSelect={mockOnSelect} />);

      fireEvent.click(screen.getByTestId('car-tag-selector'));

      expect(screen.getByTestId('car-tag-dropdown')).toBeInTheDocument();
      // Selected tag (tag-1) is hidden from dropdown, only other tags shown
      expect(screen.queryByTestId('car-tag-option-tag-1')).not.toBeInTheDocument();
      expect(screen.getByTestId('car-tag-option-tag-2')).toBeInTheDocument();
      expect(screen.getByTestId('car-tag-option-tag-3')).toBeInTheDocument();
    });

    it('should select a tag when clicked', async () => {
      render(<CarTagSelector selectedTagId="tag-1" onSelect={mockOnSelect} />);

      fireEvent.click(screen.getByTestId('car-tag-selector'));
      fireEvent.click(screen.getByTestId('car-tag-option-tag-2'));

      expect(mockOnSelect).toHaveBeenCalledWith('tag-2');
    });

    it('should select a custom (non-default) tag when clicked', async () => {
      render(<CarTagSelector selectedTagId="tag-1" onSelect={mockOnSelect} />);

      fireEvent.click(screen.getByTestId('car-tag-selector'));

      // Custom Tag has isDefault: false in mockTags
      const customTagOption = screen.getByTestId('car-tag-option-tag-3');
      expect(customTagOption).toBeInTheDocument();
      expect(customTagOption).toHaveTextContent('Custom Tag');

      fireEvent.click(customTagOption);

      expect(mockOnSelect).toHaveBeenCalledWith('tag-3');
    });

    it('should display custom tag when it is selected', async () => {
      render(<CarTagSelector selectedTagId="tag-3" onSelect={mockOnSelect} />);

      // The selector should show "Custom Tag" as the current selection
      expect(screen.getByText('Custom Tag')).toBeInTheDocument();
    });
  });

  describe('guest mode', () => {
    beforeEach(() => {
      vi.mocked(useGuestStore).mockImplementation((selector) => {
        const state = { isGuest: true };
        return selector ? selector(state as never) : state;
      });
    });

    it('should show disabled add button for guest users', async () => {
      render(<CarTagSelector selectedTagId="tag-1" onSelect={mockOnSelect} />);

      fireEvent.click(screen.getByTestId('car-tag-selector'));

      const addButton = screen.getByTestId('add-tag-disabled');
      expect(addButton).toBeInTheDocument();
      expect(addButton).toBeDisabled();
      expect(addButton).toHaveAttribute('title', 'Sign in to add tags');
    });

    it('should not show add form for guest users', async () => {
      render(<CarTagSelector selectedTagId="tag-1" onSelect={mockOnSelect} />);

      fireEvent.click(screen.getByTestId('car-tag-selector'));

      expect(screen.queryByTestId('add-tag-button')).not.toBeInTheDocument();
      expect(screen.queryByTestId('add-tag-form')).not.toBeInTheDocument();
    });
  });

  describe('authenticated mode - add custom tag', () => {
    beforeEach(() => {
      vi.mocked(useGuestStore).mockImplementation((selector) => {
        const state = { isGuest: false };
        return selector ? selector(state as never) : state;
      });
    });

    it('should show enabled add button for authenticated users', async () => {
      render(<CarTagSelector selectedTagId="tag-1" onSelect={mockOnSelect} />);

      fireEvent.click(screen.getByTestId('car-tag-selector'));

      const addButton = screen.getByTestId('add-tag-button');
      expect(addButton).toBeInTheDocument();
      expect(addButton).not.toBeDisabled();
      expect(addButton).toHaveTextContent('+ Add tag');
    });

    it('should show add form when add button is clicked', async () => {
      render(<CarTagSelector selectedTagId="tag-1" onSelect={mockOnSelect} />);

      fireEvent.click(screen.getByTestId('car-tag-selector'));
      fireEvent.click(screen.getByTestId('add-tag-button'));

      expect(screen.getByTestId('add-tag-form')).toBeInTheDocument();
      expect(screen.getByTestId('add-tag-input')).toBeInTheDocument();
      expect(screen.getByTestId('cancel-add-tag')).toBeInTheDocument();
      expect(screen.getByTestId('save-add-tag')).toBeInTheDocument();
    });

    it('should have color options in the add form', async () => {
      render(<CarTagSelector selectedTagId="tag-1" onSelect={mockOnSelect} />);

      fireEvent.click(screen.getByTestId('car-tag-selector'));
      fireEvent.click(screen.getByTestId('add-tag-button'));

      expect(screen.getByTestId('color-option-blue')).toBeInTheDocument();
      expect(screen.getByTestId('color-option-green')).toBeInTheDocument();
      expect(screen.getByTestId('color-option-red')).toBeInTheDocument();
    });

    it('should cancel add form when cancel is clicked', async () => {
      render(<CarTagSelector selectedTagId="tag-1" onSelect={mockOnSelect} />);

      fireEvent.click(screen.getByTestId('car-tag-selector'));
      fireEvent.click(screen.getByTestId('add-tag-button'));
      fireEvent.click(screen.getByTestId('cancel-add-tag'));

      expect(screen.queryByTestId('add-tag-form')).not.toBeInTheDocument();
      expect(screen.getByTestId('add-tag-button')).toBeInTheDocument();
    });

    it('should disable save button when input is empty', async () => {
      render(<CarTagSelector selectedTagId="tag-1" onSelect={mockOnSelect} />);

      fireEvent.click(screen.getByTestId('car-tag-selector'));
      fireEvent.click(screen.getByTestId('add-tag-button'));

      expect(screen.getByTestId('save-add-tag')).toBeDisabled();
    });

    it('should enable save button when name is entered', async () => {
      render(<CarTagSelector selectedTagId="tag-1" onSelect={mockOnSelect} />);

      fireEvent.click(screen.getByTestId('car-tag-selector'));
      fireEvent.click(screen.getByTestId('add-tag-button'));

      fireEvent.change(screen.getByTestId('add-tag-input'), { target: { value: 'New Tag' } });

      expect(screen.getByTestId('save-add-tag')).not.toBeDisabled();
    });

    it('should create tag when save is clicked', async () => {
      const newTag = { id: 'new-tag', name: 'New Tag', color: '#3B82F6', isDefault: false };
      mockCreateTag.mockResolvedValue(newTag);

      render(<CarTagSelector selectedTagId="tag-1" onSelect={mockOnSelect} />);

      fireEvent.click(screen.getByTestId('car-tag-selector'));
      fireEvent.click(screen.getByTestId('add-tag-button'));

      fireEvent.change(screen.getByTestId('add-tag-input'), { target: { value: 'New Tag' } });
      fireEvent.click(screen.getByTestId('save-add-tag'));

      await waitFor(() => {
        expect(mockCreateTag).toHaveBeenCalledWith('New Tag', '#3B82F6');
      });

      await waitFor(() => {
        expect(mockOnSelect).toHaveBeenCalledWith('new-tag');
      });
    });

    it('should create tag with selected color', async () => {
      const newTag = { id: 'new-tag', name: 'Red Tag', color: '#EF4444', isDefault: false };
      mockCreateTag.mockResolvedValue(newTag);

      render(<CarTagSelector selectedTagId="tag-1" onSelect={mockOnSelect} />);

      fireEvent.click(screen.getByTestId('car-tag-selector'));
      fireEvent.click(screen.getByTestId('add-tag-button'));

      // Select red color
      fireEvent.click(screen.getByTestId('color-option-red'));

      fireEvent.change(screen.getByTestId('add-tag-input'), { target: { value: 'Red Tag' } });
      fireEvent.click(screen.getByTestId('save-add-tag'));

      await waitFor(() => {
        expect(mockCreateTag).toHaveBeenCalledWith('Red Tag', '#EF4444');
      });
    });

    it('should close dropdown after creating tag', async () => {
      const newTag = { id: 'new-tag', name: 'New Tag', color: '#3B82F6', isDefault: false };
      mockCreateTag.mockResolvedValue(newTag);

      render(<CarTagSelector selectedTagId="tag-1" onSelect={mockOnSelect} />);

      fireEvent.click(screen.getByTestId('car-tag-selector'));
      fireEvent.click(screen.getByTestId('add-tag-button'));

      fireEvent.change(screen.getByTestId('add-tag-input'), { target: { value: 'New Tag' } });
      fireEvent.click(screen.getByTestId('save-add-tag'));

      await waitFor(() => {
        expect(screen.queryByTestId('car-tag-dropdown')).not.toBeInTheDocument();
      });
    });
  });

  describe('keyboard navigation', () => {
    it('should close dropdown on Escape', async () => {
      render(<CarTagSelector selectedTagId="tag-1" onSelect={mockOnSelect} />);

      fireEvent.click(screen.getByTestId('car-tag-selector'));
      expect(screen.getByTestId('car-tag-dropdown')).toBeInTheDocument();

      fireEvent.keyDown(screen.getByTestId('car-tag-selector'), { key: 'Escape' });

      expect(screen.queryByTestId('car-tag-dropdown')).not.toBeInTheDocument();
    });
  });

  describe('default tag selection with custom tags present', () => {
    const tagsWithCustom = [
      { id: 'default-1', name: 'Home', color: '#3B82F6', isDefault: true },
      { id: 'default-2', name: 'Work', color: '#10B981', isDefault: true },
      { id: 'custom-1', name: 'My Custom', color: '#EF4444', isDefault: false },
    ];

    beforeEach(() => {
      vi.mocked(useCarTagStore).mockReturnValue({
        tags: tagsWithCustom,
        isLoading: false,
        createTag: mockCreateTag,
      } as ReturnType<typeof useCarTagStore>);
    });

    it('should allow selecting a default tag when custom tags exist', async () => {
      // Start with custom tag selected
      render(<CarTagSelector selectedTagId="custom-1" onSelect={mockOnSelect} />);

      // Verify custom tag is displayed
      expect(screen.getByText('My Custom')).toBeInTheDocument();

      // Open dropdown and select a default tag
      fireEvent.click(screen.getByTestId('car-tag-selector'));
      fireEvent.click(screen.getByTestId('car-tag-option-default-1'));

      // Should call onSelect with the default tag id
      expect(mockOnSelect).toHaveBeenCalledWith('default-1');
    });

    it('should not auto-switch from default to custom tag when user explicitly selected default', async () => {
      // User has explicitly selected a default tag
      const { rerender } = render(
        <CarTagSelector selectedTagId="default-1" onSelect={mockOnSelect} />
      );

      // Clear any auto-select calls from initial render
      mockOnSelect.mockClear();

      // Rerender to trigger useEffect again
      rerender(<CarTagSelector selectedTagId="default-1" onSelect={mockOnSelect} />);

      // Should NOT call onSelect to switch away from the user's selection
      expect(mockOnSelect).not.toHaveBeenCalled();
    });

    it('should display the selected default tag correctly when custom tags exist', () => {
      render(<CarTagSelector selectedTagId="default-2" onSelect={mockOnSelect} />);

      // Should display "Work" as selected, not auto-switch to custom
      expect(screen.getByText('Work')).toBeInTheDocument();
    });
  });
});
