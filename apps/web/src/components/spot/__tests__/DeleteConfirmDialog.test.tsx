// apps/web/src/components/spot/__tests__/DeleteConfirmDialog.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeleteConfirmDialog } from '../DeleteConfirmDialog';

// Mock HTMLDialogElement methods
beforeEach(() => {
  HTMLDialogElement.prototype.showModal = vi.fn();
  HTMLDialogElement.prototype.close = vi.fn();
});

describe('DeleteConfirmDialog', () => {
  const defaultProps = {
    open: true,
    onOpenChange: vi.fn(),
    onConfirm: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Visibility', () => {
    it('should render when open is true', () => {
      render(<DeleteConfirmDialog {...defaultProps} />);

      expect(screen.getByTestId('delete-confirm-dialog')).toBeInTheDocument();
    });

    it('should not render when open is false', () => {
      render(<DeleteConfirmDialog {...defaultProps} open={false} />);

      expect(screen.queryByTestId('delete-confirm-dialog')).not.toBeInTheDocument();
    });

    it('should call showModal when open changes to true', () => {
      render(<DeleteConfirmDialog {...defaultProps} />);

      expect(HTMLDialogElement.prototype.showModal).toHaveBeenCalled();
    });
  });

  describe('Content display', () => {
    it('should display title', () => {
      render(<DeleteConfirmDialog {...defaultProps} />);

      expect(screen.getByTestId('delete-dialog-title')).toHaveTextContent('Delete Parking Spot?');
    });

    it('should display description without address', () => {
      render(<DeleteConfirmDialog {...defaultProps} />);

      expect(screen.getByTestId('delete-dialog-description')).toHaveTextContent(
        'This will permanently delete your saved spot. This action cannot be undone.'
      );
    });

    it('should display address in description when provided', () => {
      render(<DeleteConfirmDialog {...defaultProps} spotAddress="123 Main Street" />);

      expect(screen.getByTestId('delete-dialog-address')).toHaveTextContent('at 123 Main Street');
    });

    it('should not display address when null', () => {
      render(<DeleteConfirmDialog {...defaultProps} spotAddress={null} />);

      expect(screen.queryByTestId('delete-dialog-address')).not.toBeInTheDocument();
    });
  });

  describe('Buttons', () => {
    it('should display Cancel button', () => {
      render(<DeleteConfirmDialog {...defaultProps} />);

      expect(screen.getByTestId('delete-cancel-button')).toBeInTheDocument();
      expect(screen.getByTestId('delete-cancel-button')).toHaveTextContent('Cancel');
    });

    it('should display Delete button', () => {
      render(<DeleteConfirmDialog {...defaultProps} />);

      expect(screen.getByTestId('delete-confirm-button')).toBeInTheDocument();
      expect(screen.getByTestId('delete-confirm-button')).toHaveTextContent('Delete');
    });

    it('should call onOpenChange with false when Cancel clicked', () => {
      render(<DeleteConfirmDialog {...defaultProps} />);

      fireEvent.click(screen.getByTestId('delete-cancel-button'));

      expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    });

    it('should call onConfirm when Delete clicked', () => {
      render(<DeleteConfirmDialog {...defaultProps} />);

      fireEvent.click(screen.getByTestId('delete-confirm-button'));

      expect(defaultProps.onConfirm).toHaveBeenCalled();
    });
  });

  describe('Loading state', () => {
    it('should show loading text when isDeleting', () => {
      render(<DeleteConfirmDialog {...defaultProps} isDeleting />);

      expect(screen.getByTestId('delete-confirm-button')).toHaveTextContent('Deleting...');
    });

    it('should disable Cancel button when isDeleting', () => {
      render(<DeleteConfirmDialog {...defaultProps} isDeleting />);

      expect(screen.getByTestId('delete-cancel-button')).toBeDisabled();
    });

    it('should disable Delete button when isDeleting', () => {
      render(<DeleteConfirmDialog {...defaultProps} isDeleting />);

      expect(screen.getByTestId('delete-confirm-button')).toBeDisabled();
    });

    it('should not close dialog when Cancel clicked while deleting', () => {
      render(<DeleteConfirmDialog {...defaultProps} isDeleting />);

      fireEvent.click(screen.getByTestId('delete-cancel-button'));

      expect(defaultProps.onOpenChange).not.toHaveBeenCalled();
    });
  });

  describe('Accessibility', () => {
    it('should have aria-labelledby pointing to title', () => {
      render(<DeleteConfirmDialog {...defaultProps} />);

      const dialog = screen.getByTestId('delete-confirm-dialog');
      expect(dialog).toHaveAttribute('aria-labelledby', 'delete-dialog-title');
    });

    it('should have aria-describedby pointing to description', () => {
      render(<DeleteConfirmDialog {...defaultProps} />);

      const dialog = screen.getByTestId('delete-confirm-dialog');
      expect(dialog).toHaveAttribute('aria-describedby', 'delete-dialog-description');
    });
  });

  describe('Backdrop click', () => {
    it('should call onOpenChange when clicking backdrop', () => {
      render(<DeleteConfirmDialog {...defaultProps} />);

      const dialog = screen.getByTestId('delete-confirm-dialog');
      // Simulate clicking directly on the dialog (backdrop area)
      fireEvent.click(dialog);

      expect(defaultProps.onOpenChange).toHaveBeenCalledWith(false);
    });

    it('should not close when clicking backdrop while deleting', () => {
      render(<DeleteConfirmDialog {...defaultProps} isDeleting />);

      const dialog = screen.getByTestId('delete-confirm-dialog');
      fireEvent.click(dialog);

      expect(defaultProps.onOpenChange).not.toHaveBeenCalled();
    });
  });
});
