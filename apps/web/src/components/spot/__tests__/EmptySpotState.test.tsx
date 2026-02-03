// apps/web/src/components/spot/__tests__/EmptySpotState.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EmptySpotState } from '../EmptySpotState';

describe('EmptySpotState', () => {
  it('should render the parking icon', () => {
    render(<EmptySpotState />);

    expect(screen.getByText('🅿️')).toBeInTheDocument();
  });

  it('should display "No parking spot saved yet" message', () => {
    render(<EmptySpotState />);

    expect(screen.getByText('No parking spot saved yet')).toBeInTheDocument();
  });

  it('should display prompt to save first spot', () => {
    render(<EmptySpotState />);

    expect(screen.getByText('Tap below to save your first spot')).toBeInTheDocument();
  });

  it('should have correct testid', () => {
    render(<EmptySpotState />);

    expect(screen.getByTestId('empty-spot-state')).toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<EmptySpotState className="mt-4" />);

    const element = screen.getByTestId('empty-spot-state');
    expect(element.className).toContain('mt-4');
  });
});
