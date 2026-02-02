// apps/web/src/components/ui/__tests__/UploadProgress.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { UploadProgress } from '../UploadProgress';

describe('UploadProgress', () => {
  describe('idle state', () => {
    it('should not render anything when status is idle', () => {
      const { container } = render(<UploadProgress status="idle" progress={0} />);
      expect(container.firstChild).toBeNull();
    });
  });

  describe('processing state', () => {
    it('should show processing message', () => {
      render(<UploadProgress status="processing" progress={25} />);

      expect(screen.getByText('Processing...')).toBeInTheDocument();
      expect(screen.getByTestId('upload-progress')).toHaveAttribute('data-status', 'processing');
    });

    it('should show progress percentage', () => {
      render(<UploadProgress status="processing" progress={45} />);

      expect(screen.getByText('45%')).toBeInTheDocument();
    });

    it('should show progress bar with correct width', () => {
      render(<UploadProgress status="processing" progress={60} />);

      const progressBar = screen.getByRole('progressbar');
      expect(progressBar).toHaveStyle({ width: '60%' });
      expect(progressBar).toHaveAttribute('aria-valuenow', '60');
    });
  });

  describe('uploading state', () => {
    it('should show uploading message', () => {
      render(<UploadProgress status="uploading" progress={75} />);

      expect(screen.getByText('Uploading...')).toBeInTheDocument();
      expect(screen.getByTestId('upload-progress')).toHaveAttribute('data-status', 'uploading');
    });

    it('should show cancel button when onCancel provided', () => {
      const onCancel = vi.fn();
      render(<UploadProgress status="uploading" progress={50} onCancel={onCancel} />);

      const cancelButton = screen.getByTestId('cancel-button');
      expect(cancelButton).toBeInTheDocument();

      fireEvent.click(cancelButton);
      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('success state', () => {
    it('should show success message', () => {
      render(<UploadProgress status="success" progress={100} />);

      expect(screen.getByText('Upload complete!')).toBeInTheDocument();
      expect(screen.getByTestId('upload-progress')).toHaveAttribute('data-status', 'success');
    });

    it('should show dismiss button when onCancel provided', () => {
      const onCancel = vi.fn();
      render(<UploadProgress status="success" progress={100} onCancel={onCancel} />);

      const dismissButton = screen.getByTestId('dismiss-button');
      expect(dismissButton).toBeInTheDocument();

      fireEvent.click(dismissButton);
      expect(onCancel).toHaveBeenCalledTimes(1);
    });
  });

  describe('error state', () => {
    it('should show error message', () => {
      render(<UploadProgress status="error" progress={0} />);

      expect(screen.getByText('Upload failed')).toBeInTheDocument();
      expect(screen.getByTestId('upload-progress')).toHaveAttribute('data-status', 'error');
    });

    it('should show custom error message when provided', () => {
      render(<UploadProgress status="error" progress={0} errorMessage="Network connection lost" />);

      expect(screen.getByTestId('error-message')).toHaveTextContent('Network connection lost');
    });

    it('should show retry button when onRetry provided', () => {
      const onRetry = vi.fn();
      render(<UploadProgress status="error" progress={0} onRetry={onRetry} />);

      const retryButton = screen.getByTestId('retry-button');
      expect(retryButton).toBeInTheDocument();

      fireEvent.click(retryButton);
      expect(onRetry).toHaveBeenCalledTimes(1);
    });
  });

  describe('progress rounding', () => {
    it('should round progress to nearest integer', () => {
      render(<UploadProgress status="uploading" progress={33.7} />);

      expect(screen.getByText('34%')).toBeInTheDocument();
    });
  });
});
