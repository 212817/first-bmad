// apps/web/src/hooks/useFilePicker/useFilePicker.ts
import { useState, useRef, useCallback } from 'react';
import type { UseFilePickerReturn, PickImageOptions } from './types';
import { ACCEPT_IMAGE_STRING } from './types';

/**
 * Check if file is a HEIC/HEIF image (common on iOS)
 */
const isHeicFile = (file: File): boolean => {
  const type = file.type.toLowerCase();
  const name = file.name.toLowerCase();
  return (
    type === 'image/heic' ||
    type === 'image/heif' ||
    name.endsWith('.heic') ||
    name.endsWith('.heif')
  );
};

/**
 * Hook for picking images from device gallery/file system
 * Provides a clean async API for file selection
 */
export const useFilePicker = (): UseFilePickerReturn => {
  const [isSelecting, setIsSelecting] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const resolveRef = useRef<((file: File | null) => void) | null>(null);

  /**
   * Create and configure hidden file input
   */
  const getOrCreateInput = useCallback((accept: string): HTMLInputElement => {
    if (!inputRef.current) {
      const input = document.createElement('input');
      input.type = 'file';
      input.style.display = 'none';
      document.body.appendChild(input);
      inputRef.current = input;
    }

    inputRef.current.accept = accept;
    // Don't set capture attribute to allow gallery access
    inputRef.current.removeAttribute('capture');
    return inputRef.current;
  }, []);

  /**
   * Clean up file input and listeners
   */
  const cleanup = useCallback(() => {
    if (inputRef.current) {
      inputRef.current.value = '';
    }
    setIsSelecting(false);
  }, []);

  /**
   * Reset hook state
   */
  const reset = useCallback(() => {
    if (inputRef.current) {
      document.body.removeChild(inputRef.current);
      inputRef.current = null;
    }
    resolveRef.current = null;
    setIsSelecting(false);
  }, []);

  /**
   * Pick an image from the device
   * Opens native file picker and returns selected file
   * Returns null if user cancels
   */
  const pickImage = useCallback(
    (options: PickImageOptions = {}): Promise<File | null> => {
      return new Promise((resolve) => {
        const accept = options.accept ?? ACCEPT_IMAGE_STRING;
        const input = getOrCreateInput(accept);

        // Store resolve function for later
        resolveRef.current = resolve;
        setIsSelecting(true);

        // Handle file selection
        const handleChange = () => {
          const file = input.files?.[0] ?? null;

          // Log HEIC detection for debugging
          if (file && isHeicFile(file)) {
            console.debug('[useFilePicker] HEIC file detected:', file.name);
          }

          cleanup();
          resolveRef.current?.(file);
          resolveRef.current = null;
          input.removeEventListener('change', handleChange);
          input.removeEventListener('cancel', handleCancel);
        };

        // Handle cancel (user closes picker without selecting)
        const handleCancel = () => {
          cleanup();
          resolveRef.current?.(null);
          resolveRef.current = null;
          input.removeEventListener('change', handleChange);
          input.removeEventListener('cancel', handleCancel);
        };

        input.addEventListener('change', handleChange);
        input.addEventListener('cancel', handleCancel);

        // Trigger file picker
        input.click();
      });
    },
    [getOrCreateInput, cleanup]
  );

  return {
    pickImage,
    isSelecting,
    inputRef,
    reset,
  };
};
