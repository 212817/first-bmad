// apps/web/src/App.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import App from './App';

// Mock the API client
vi.mock('@/services/api/client', () => ({
  checkHealth: vi.fn().mockRejectedValue(new Error('API not available')),
}));

// Mock IndexedDB service
vi.mock('@/services/storage/indexedDb.service', () => ({
  indexedDbService: {
    db: null,
    init: vi.fn().mockResolvedValue(undefined),
    getItem: vi.fn().mockResolvedValue(null),
    setItem: vi.fn().mockResolvedValue(undefined),
    deleteItem: vi.fn().mockResolvedValue(undefined),
    getAllItems: vi.fn().mockResolvedValue([]),
    clearStore: vi.fn().mockResolvedValue(undefined),
    isAvailable: vi.fn().mockReturnValue(true),
  },
}));

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the heading after loading', async () => {
    render(<App />);

    // Wait for the app to finish loading
    await waitFor(() => {
      expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Where Did I Park?');
    });
  });
});
