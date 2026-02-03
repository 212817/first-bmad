// apps/web/src/components/spot/__tests__/SpotThumbnail.test.tsx
import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SpotThumbnail } from '../SpotThumbnail';

describe('SpotThumbnail', () => {
  it('should render with loading state initially', () => {
    render(<SpotThumbnail url="https://example.com/photo.jpg" />);

    expect(screen.getByTestId('spot-thumbnail')).toBeInTheDocument();
    expect(screen.getByTestId('spot-thumbnail-loading')).toBeInTheDocument();
  });

  it('should hide loading state after image loads', () => {
    render(<SpotThumbnail url="https://example.com/photo.jpg" />);

    const img = screen.getByRole('img');
    fireEvent.load(img);

    expect(screen.queryByTestId('spot-thumbnail-loading')).not.toBeInTheDocument();
  });

  it('should show error state when image fails to load', () => {
    render(<SpotThumbnail url="https://example.com/invalid.jpg" />);

    const img = screen.getByRole('img');
    fireEvent.error(img);

    expect(screen.getByTestId('spot-thumbnail-error')).toBeInTheDocument();
    expect(screen.queryByTestId('spot-thumbnail')).not.toBeInTheDocument();
  });

  it('should apply custom className', () => {
    render(<SpotThumbnail url="https://example.com/photo.jpg" className="w-16 h-16 rounded" />);

    const container = screen.getByTestId('spot-thumbnail');
    expect(container.className).toContain('w-16');
    expect(container.className).toContain('h-16');
    expect(container.className).toContain('rounded');
  });

  it('should use default alt text', () => {
    render(<SpotThumbnail url="https://example.com/photo.jpg" />);

    expect(screen.getByRole('img')).toHaveAttribute('alt', 'Parking spot photo');
  });

  it('should use custom alt text', () => {
    render(<SpotThumbnail url="https://example.com/photo.jpg" alt="My spot" />);

    expect(screen.getByRole('img')).toHaveAttribute('alt', 'My spot');
  });

  it('should have lazy loading enabled', () => {
    render(<SpotThumbnail url="https://example.com/photo.jpg" />);

    expect(screen.getByRole('img')).toHaveAttribute('loading', 'lazy');
  });
});
