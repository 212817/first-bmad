// apps/web/src/components/spot/__tests__/SpotSearchInput.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { SpotSearchInput } from '../SpotSearchInput';

describe('SpotSearchInput', () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render with placeholder', () => {
    render(<SpotSearchInput value="" onChange={mockOnChange} />);
    expect(screen.getByPlaceholderText('Search spots...')).toBeInTheDocument();
  });

  it('should render with custom placeholder', () => {
    render(<SpotSearchInput value="" onChange={mockOnChange} placeholder="Find a spot..." />);
    expect(screen.getByPlaceholderText('Find a spot...')).toBeInTheDocument();
  });

  it('should display initial value', () => {
    render(<SpotSearchInput value="downtown" onChange={mockOnChange} />);
    expect(screen.getByDisplayValue('downtown')).toBeInTheDocument();
  });

  it('should show clear button when has value', () => {
    render(<SpotSearchInput value="test" onChange={mockOnChange} />);
    expect(screen.getByLabelText('Clear search')).toBeInTheDocument();
  });

  it('should not show clear button when empty', () => {
    render(<SpotSearchInput value="" onChange={mockOnChange} />);
    expect(screen.queryByLabelText('Clear search')).not.toBeInTheDocument();
  });

  it('should debounce onChange calls', async () => {
    vi.useFakeTimers();

    render(<SpotSearchInput value="" onChange={mockOnChange} />);

    const input = screen.getByTestId('search-input');

    await act(async () => {
      fireEvent.change(input, { target: { value: 'd' } });
      fireEvent.change(input, { target: { value: 'do' } });
      fireEvent.change(input, { target: { value: 'dow' } });
    });

    // onChange should not be called immediately
    expect(mockOnChange).not.toHaveBeenCalled();

    // Fast forward 300ms (debounce time)
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    // Now onChange should be called with final value
    expect(mockOnChange).toHaveBeenCalledTimes(1);
    expect(mockOnChange).toHaveBeenCalledWith('dow');

    vi.useRealTimers();
  });

  it('should clear input and call onChange immediately when clear button clicked', () => {
    render(<SpotSearchInput value="test" onChange={mockOnChange} />);

    const clearButton = screen.getByLabelText('Clear search');
    fireEvent.click(clearButton);

    // onChange should be called immediately with empty string
    expect(mockOnChange).toHaveBeenCalledWith('');
    expect(screen.getByTestId('search-input')).toHaveValue('');
  });

  it('should have accessible label', () => {
    render(<SpotSearchInput value="" onChange={mockOnChange} />);
    expect(screen.getByLabelText('Search spots')).toBeInTheDocument();
  });

  it('should have search icon', () => {
    render(<SpotSearchInput value="" onChange={mockOnChange} />);
    expect(screen.getByTestId('spot-search-input')).toBeInTheDocument();
  });
});
