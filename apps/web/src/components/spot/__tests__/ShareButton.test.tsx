// apps/web/src/components/spot/__tests__/ShareButton.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ShareButton } from '../ShareButton';
import * as spotStoreModule from '@/stores/spotStore';
import * as guestStoreModule from '@/stores/guestStore';
import * as shareServiceModule from '@/services/share/share.service';

// Mock the stores and services
vi.mock('@/stores/spotStore', () => ({
  useSpotStore: vi.fn(),
}));

vi.mock('@/stores/guestStore', () => ({
  useGuestStore: vi.fn(),
}));

vi.mock('@/services/share/share.service', () => ({
  shareService: {
    canUseWebShare: vi.fn(),
    shareSpot: vi.fn(),
    copyToClipboard: vi.fn(),
  },
}));

describe('ShareButton', () => {
  const mockCreateShareLink = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(spotStoreModule.useSpotStore).mockReturnValue({
      createShareLink: mockCreateShareLink,
    } as unknown as ReturnType<typeof spotStoreModule.useSpotStore>);
    vi.mocked(guestStoreModule.useGuestStore).mockReturnValue({
      isGuest: false,
    } as unknown as ReturnType<typeof guestStoreModule.useGuestStore>);
    vi.mocked(shareServiceModule.shareService.canUseWebShare).mockReturnValue(false);
    vi.mocked(shareServiceModule.shareService.shareSpot).mockResolvedValue(false);
    vi.mocked(shareServiceModule.shareService.copyToClipboard).mockResolvedValue(undefined);
  });

  it('should render share button with text', () => {
    render(<ShareButton spotId="spot-123" />);

    expect(screen.getByTestId('share-button')).toBeInTheDocument();
    expect(screen.getByText('Share')).toBeInTheDocument();
  });

  it('should render icon-only variant', () => {
    render(<ShareButton spotId="spot-123" variant="icon" />);

    expect(screen.getByTestId('share-button')).toBeInTheDocument();
    expect(screen.queryByText('Share')).not.toBeInTheDocument();
  });

  it('should show loading state while sharing', async () => {
    mockCreateShareLink.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ shareUrl: 'https://example.com/s/abc', expiresAt: '' }), 100);
        })
    );

    render(<ShareButton spotId="spot-123" />);

    fireEvent.click(screen.getByTestId('share-button'));

    await waitFor(() => {
      expect(screen.getByText('Sharing...')).toBeInTheDocument();
    });

    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });
  });

  it('should use Web Share API when available', async () => {
    mockCreateShareLink.mockResolvedValue({
      shareUrl: 'https://example.com/s/abc',
      expiresAt: '2026-02-11T00:00:00Z',
    });
    vi.mocked(shareServiceModule.shareService.shareSpot).mockResolvedValue(true);

    render(<ShareButton spotId="spot-123" spotAddress="123 Main St" />);

    fireEvent.click(screen.getByTestId('share-button'));

    await waitFor(() => {
      expect(shareServiceModule.shareService.shareSpot).toHaveBeenCalledWith(
        'https://example.com/s/abc',
        '123 Main St'
      );
    });
  });

  it('should fall back to clipboard when Web Share fails', async () => {
    mockCreateShareLink.mockResolvedValue({
      shareUrl: 'https://example.com/s/abc',
      expiresAt: '2026-02-11T00:00:00Z',
    });
    vi.mocked(shareServiceModule.shareService.shareSpot).mockResolvedValue(false);

    render(<ShareButton spotId="spot-123" />);

    fireEvent.click(screen.getByTestId('share-button'));

    await waitFor(() => {
      expect(shareServiceModule.shareService.copyToClipboard).toHaveBeenCalledWith(
        'https://example.com/s/abc'
      );
    });

    await waitFor(() => {
      expect(screen.getByText('Copied!')).toBeInTheDocument();
    });
  });

  it('should show error state on failure', async () => {
    mockCreateShareLink.mockRejectedValue(new Error('Network error'));

    render(<ShareButton spotId="spot-123" />);

    fireEvent.click(screen.getByTestId('share-button'));

    await waitFor(() => {
      expect(screen.getByText('Error')).toBeInTheDocument();
    });
  });

  it('should use default title when no address provided', async () => {
    mockCreateShareLink.mockResolvedValue({
      shareUrl: 'https://example.com/s/abc',
      expiresAt: '2026-02-11T00:00:00Z',
    });
    vi.mocked(shareServiceModule.shareService.shareSpot).mockResolvedValue(true);

    render(<ShareButton spotId="spot-123" />);

    fireEvent.click(screen.getByTestId('share-button'));

    await waitFor(() => {
      expect(shareServiceModule.shareService.shareSpot).toHaveBeenCalledWith(
        'https://example.com/s/abc',
        'My Parking Spot'
      );
    });
  });

  it('should apply custom className', () => {
    render(<ShareButton spotId="spot-123" className="custom-class" />);

    expect(screen.getByTestId('share-button')).toHaveClass('custom-class');
  });

  it('should be disabled during share operation', async () => {
    mockCreateShareLink.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve({ shareUrl: 'https://example.com/s/abc', expiresAt: '' }), 100);
        })
    );

    render(<ShareButton spotId="spot-123" />);

    fireEvent.click(screen.getByTestId('share-button'));

    await waitFor(() => {
      expect(screen.getByTestId('share-button')).toBeDisabled();
    });
  });

  describe('guest mode', () => {
    beforeEach(() => {
      vi.mocked(guestStoreModule.useGuestStore).mockReturnValue({
        isGuest: true,
      } as unknown as ReturnType<typeof guestStoreModule.useGuestStore>);
    });

    it('should be disabled for guest users', () => {
      render(<ShareButton spotId="spot-123" />);

      expect(screen.getByTestId('share-button')).toBeDisabled();
    });

    it('should show tooltip hint for guest users', () => {
      render(<ShareButton spotId="spot-123" />);

      expect(screen.getByTestId('share-button')).toHaveAttribute('title', 'Sign in to share spots');
    });

    it('should not call createShareLink when clicked in guest mode', async () => {
      render(<ShareButton spotId="spot-123" />);

      fireEvent.click(screen.getByTestId('share-button'));

      await waitFor(() => {
        expect(mockCreateShareLink).not.toHaveBeenCalled();
      });
    });
  });
});
