// apps/web/src/components/ui/__tests__/NoCoordinatesWarning.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { NoCoordinatesWarning } from '../NoCoordinatesWarning';

describe('NoCoordinatesWarning', () => {
  it('should render the warning component', () => {
    render(<NoCoordinatesWarning />);

    expect(screen.getByTestId('no-coordinates-warning')).toBeInTheDocument();
  });

  it('should display warning icon (SVG)', () => {
    render(<NoCoordinatesWarning />);

    const warning = screen.getByTestId('no-coordinates-warning');
    expect(warning.querySelector('svg')).toBeInTheDocument();
  });

  it('should display warning message about navigation', () => {
    render(<NoCoordinatesWarning />);

    expect(screen.getByText(/navigation may be less accurate/i)).toBeInTheDocument();
  });

  it('should mention GPS coordinates in the message', () => {
    render(<NoCoordinatesWarning />);

    expect(screen.getByText(/GPS coordinates/i)).toBeInTheDocument();
  });

  it('should have alert role for accessibility', () => {
    render(<NoCoordinatesWarning />);

    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('should have amber/warning background color', () => {
    render(<NoCoordinatesWarning />);

    const warning = screen.getByTestId('no-coordinates-warning');
    expect(warning.className).toContain('amber');
  });

  it('should suggest enabling location permission', () => {
    render(<NoCoordinatesWarning />);

    expect(screen.getByText(/location permission/i)).toBeInTheDocument();
  });
});
