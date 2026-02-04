// apps/web/src/components/spot/__tests__/NoResultsState.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NoResultsState } from '../NoResultsState';

describe('NoResultsState', () => {
  it('should render no results message', () => {
    render(<NoResultsState onClear={vi.fn()} />);

    expect(screen.getByText('No spots found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search or filters')).toBeInTheDocument();
  });

  it('should render clear filters button', () => {
    render(<NoResultsState onClear={vi.fn()} />);

    expect(screen.getByText('Clear filters')).toBeInTheDocument();
  });

  it('should call onClear when button clicked', () => {
    const mockOnClear = vi.fn();
    render(<NoResultsState onClear={mockOnClear} />);

    fireEvent.click(screen.getByText('Clear filters'));

    expect(mockOnClear).toHaveBeenCalledTimes(1);
  });

  it('should have testid for E2E tests', () => {
    render(<NoResultsState onClear={vi.fn()} />);

    expect(screen.getByTestId('no-results-state')).toBeInTheDocument();
  });

  it('should have accessible search icon', () => {
    render(<NoResultsState onClear={vi.fn()} />);

    expect(screen.getByLabelText('Search icon')).toBeInTheDocument();
  });
});
