// apps/web/src/pages/__tests__/HealthPage.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { HealthPage } from '../HealthPage';
import * as apiClient from '@/services/api/client';

vi.mock('@/services/api/client', () => ({
  checkHealth: vi.fn(),
}));

const renderHealthPage = () => {
  return render(
    <MemoryRouter>
      <HealthPage />
    </MemoryRouter>
  );
};

describe('HealthPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loading state', () => {
    it('should show loading indicator initially', () => {
      vi.mocked(apiClient.checkHealth).mockImplementation(() => new Promise(() => {}));

      renderHealthPage();

      expect(screen.getByText('Checking connection...')).toBeInTheDocument();
    });
  });

  describe('success state', () => {
    const mockHealth = {
      api: 'ok',
      database: 'ok',
      timestamp: '2026-01-15T12:00:00Z',
    };

    beforeEach(() => {
      vi.mocked(apiClient.checkHealth).mockResolvedValue(mockHealth);
    });

    it('should display health status when loaded', async () => {
      renderHealthPage();

      await waitFor(() => {
        expect(screen.getByText('API:')).toBeInTheDocument();
      });

      expect(screen.getAllByText('ok')).toHaveLength(2);
      expect(screen.getByText('Database:')).toBeInTheDocument();
    });

    it('should show API status as green when ok', async () => {
      renderHealthPage();

      await waitFor(() => {
        expect(screen.getByText('API:')).toBeInTheDocument();
      });

      const apiStatus = screen.getAllByText('ok')[0];
      expect(apiStatus).toHaveClass('text-green-600');
    });

    it('should show last checked time', async () => {
      renderHealthPage();

      await waitFor(() => {
        expect(screen.getByText('Last checked:')).toBeInTheDocument();
      });
    });
  });

  describe('error state', () => {
    it('should show error message when health check fails', async () => {
      vi.mocked(apiClient.checkHealth).mockRejectedValue(new Error('Network error'));

      renderHealthPage();

      await waitFor(() => {
        expect(screen.getByText('Could not connect to API')).toBeInTheDocument();
      });
    });
  });

  describe('refresh button', () => {
    it('should refetch health on refresh click', async () => {
      const mockHealth = {
        api: 'ok',
        database: 'ok',
        timestamp: '2026-01-15T12:00:00Z',
      };
      vi.mocked(apiClient.checkHealth).mockResolvedValue(mockHealth);

      renderHealthPage();

      await waitFor(() => {
        expect(screen.getAllByText('ok')).toHaveLength(2);
      });

      // Click refresh
      fireEvent.click(screen.getByText('Refresh'));

      expect(apiClient.checkHealth).toHaveBeenCalledTimes(2);
    });
  });

  describe('navigation', () => {
    it('should have back to home link', async () => {
      vi.mocked(apiClient.checkHealth).mockResolvedValue({
        api: 'ok',
        database: 'ok',
        timestamp: new Date().toISOString(),
      });

      renderHealthPage();

      await waitFor(() => {
        expect(screen.getByText('Back to Home')).toBeInTheDocument();
      });

      expect(screen.getByText('Back to Home').closest('a')).toHaveAttribute('href', '/');
    });
  });

  describe('unhealthy states', () => {
    it('should show database as yellow when unhealthy', async () => {
      vi.mocked(apiClient.checkHealth).mockResolvedValue({
        api: 'ok',
        database: 'error',
        timestamp: new Date().toISOString(),
      });

      renderHealthPage();

      await waitFor(() => {
        expect(screen.getByText('error')).toBeInTheDocument();
      });

      expect(screen.getByText('error')).toHaveClass('text-yellow-600');
    });

    it('should show API as red when unhealthy', async () => {
      vi.mocked(apiClient.checkHealth).mockResolvedValue({
        api: 'error',
        database: 'ok',
        timestamp: new Date().toISOString(),
      });

      renderHealthPage();

      await waitFor(() => {
        expect(screen.getByText('error')).toBeInTheDocument();
      });

      expect(screen.getByText('error')).toHaveClass('text-red-600');
    });
  });
});
