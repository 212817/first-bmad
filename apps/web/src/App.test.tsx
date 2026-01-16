// apps/web/src/App.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from './App';

// Mock the API client
vi.mock('@/services/api/client', () => ({
  checkHealth: vi.fn().mockRejectedValue(new Error('API not available')),
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the heading', () => {
    render(<App />);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Where Did I Park?');
  });
});
