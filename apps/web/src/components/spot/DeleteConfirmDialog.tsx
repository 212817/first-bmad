// apps/web/src/components/spot/DeleteConfirmDialog.tsx
import { useEffect, useRef } from 'react';

/**
 * Props for DeleteConfirmDialog component
 */
export interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  spotAddress?: string | null;
  onConfirm: () => void;
  isDeleting?: boolean;
}

/**
 * Accessible confirmation dialog for deleting a parking spot
 * Uses native dialog element for accessibility with fallback for JSDOM
 */
export const DeleteConfirmDialog = ({
  open,
  onOpenChange,
  spotAddress,
  onConfirm,
  isDeleting = false,
}: DeleteConfirmDialogProps) => {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const cancelButtonRef = useRef<HTMLButtonElement>(null);

  // Sync dialog open state with prop
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open && !dialog.open) {
      // Use showModal if available, otherwise set open attribute (for JSDOM)
      if (typeof dialog.showModal === 'function') {
        dialog.showModal();
      } else {
        dialog.setAttribute('open', '');
      }
      // Focus cancel button for safety
      cancelButtonRef.current?.focus();
    } else if (!open && dialog.open) {
      if (typeof dialog.close === 'function') {
        dialog.close();
      } else {
        dialog.removeAttribute('open');
      }
    }
  }, [open]);

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === dialogRef.current && !isDeleting) {
      onOpenChange(false);
    }
  };

  // Handle escape key (native dialog handles this, but we sync state)
  const handleCancel = (e: React.SyntheticEvent) => {
    if (isDeleting) {
      e.preventDefault();
      return;
    }
    onOpenChange(false);
  };

  // Handle cancel button click
  const handleCancelClick = () => {
    if (!isDeleting) {
      onOpenChange(false);
    }
  };

  // Handle delete confirm
  const handleConfirmClick = () => {
    onConfirm();
  };

  if (!open) return null;

  return (
    <dialog
      ref={dialogRef}
      className="fixed inset-0 m-auto p-0 bg-transparent backdrop:bg-black/50 max-w-md w-[90%] rounded-lg"
      onClick={handleBackdropClick}
      onCancel={handleCancel}
      aria-labelledby="delete-dialog-title"
      aria-describedby="delete-dialog-description"
      data-testid="delete-confirm-dialog"
    >
      <div className="bg-white rounded-lg p-6 shadow-xl">
        {/* Warning Icon */}
        <div className="flex justify-center mb-4">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
            <span className="text-2xl" aria-hidden="true">
              ⚠️
            </span>
          </div>
        </div>

        {/* Title */}
        <h2
          id="delete-dialog-title"
          className="text-lg font-semibold text-gray-900 text-center"
          data-testid="delete-dialog-title"
        >
          Delete Parking Spot?
        </h2>

        {/* Description */}
        <p
          id="delete-dialog-description"
          className="mt-2 text-gray-600 text-center"
          data-testid="delete-dialog-description"
        >
          This will permanently delete your saved spot
          {spotAddress && (
            <span className="font-medium" data-testid="delete-dialog-address">
              {' '}
              at {spotAddress}
            </span>
          )}
          . This action cannot be undone.
        </p>

        {/* Buttons */}
        <div className="flex gap-3 mt-6">
          <button
            ref={cancelButtonRef}
            type="button"
            onClick={handleCancelClick}
            disabled={isDeleting}
            className="flex-1 h-11 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-100 disabled:text-gray-400 text-gray-700 font-medium rounded-lg transition-colors"
            data-testid="delete-cancel-button"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmClick}
            disabled={isDeleting}
            className="flex-1 h-11 bg-red-600 hover:bg-red-700 disabled:bg-red-400 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
            data-testid="delete-confirm-button"
          >
            {isDeleting ? (
              <>
                <span
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                  aria-hidden="true"
                />
                Deleting...
              </>
            ) : (
              'Delete'
            )}
          </button>
        </div>
      </div>
    </dialog>
  );
};
