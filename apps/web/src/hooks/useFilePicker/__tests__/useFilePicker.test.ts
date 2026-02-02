// apps/web/src/hooks/useFilePicker/__tests__/useFilePicker.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFilePicker } from '../useFilePicker';
import { ACCEPT_IMAGE_STRING } from '../types';

describe('useFilePicker', () => {
  let appendChildSpy: ReturnType<typeof vi.spyOn>;
  let removeChildSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock appendChild/removeChild to prevent actual DOM manipulation
    appendChildSpy = vi.spyOn(document.body, 'appendChild').mockImplementation((node) => node);
    removeChildSpy = vi.spyOn(document.body, 'removeChild').mockImplementation((node) => node);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should return initial state with isSelecting false', () => {
      const { result } = renderHook(() => useFilePicker());

      expect(result.current.isSelecting).toBe(false);
      expect(result.current.inputRef.current).toBeNull();
    });

    it('should provide all required functions', () => {
      const { result } = renderHook(() => useFilePicker());

      expect(typeof result.current.pickImage).toBe('function');
      expect(typeof result.current.reset).toBe('function');
    });
  });

  describe('pickImage', () => {
    it('should set isSelecting to true when called', () => {
      const { result } = renderHook(() => useFilePicker());

      act(() => {
        result.current.pickImage();
      });

      expect(result.current.isSelecting).toBe(true);
    });

    it('should create and append file input to DOM', () => {
      const { result } = renderHook(() => useFilePicker());

      act(() => {
        result.current.pickImage();
      });

      expect(appendChildSpy).toHaveBeenCalled();
      const input = result.current.inputRef.current;
      expect(input).toBeInstanceOf(HTMLInputElement);
      expect(input?.type).toBe('file');
    });

    it('should set correct accept attribute for images', () => {
      const { result } = renderHook(() => useFilePicker());

      act(() => {
        result.current.pickImage();
      });

      const input = result.current.inputRef.current;
      expect(input?.accept).toBe(ACCEPT_IMAGE_STRING);
    });

    it('should use custom accept when provided', () => {
      const { result } = renderHook(() => useFilePicker());

      act(() => {
        result.current.pickImage({ accept: 'image/jpeg' });
      });

      const input = result.current.inputRef.current;
      expect(input?.accept).toBe('image/jpeg');
    });

    it('should resolve with file when change event fires', async () => {
      const { result } = renderHook(() => useFilePicker());
      const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      let resolvedFile: File | null = null;

      await act(async () => {
        const promise = result.current.pickImage();
        const input = result.current.inputRef.current!;

        // Simulate file selection
        Object.defineProperty(input, 'files', {
          value: [testFile],
          configurable: true,
        });

        // Dispatch change event
        input.dispatchEvent(new Event('change'));

        resolvedFile = await promise;
      });

      expect(resolvedFile).toBe(testFile);
      expect(result.current.isSelecting).toBe(false);
    });

    it('should resolve with null when cancel event fires', async () => {
      const { result } = renderHook(() => useFilePicker());

      let resolvedFile: File | null | undefined = undefined;

      await act(async () => {
        const promise = result.current.pickImage();
        const input = result.current.inputRef.current!;

        // Dispatch cancel event
        input.dispatchEvent(new Event('cancel'));

        resolvedFile = await promise;
      });

      expect(resolvedFile).toBeNull();
      expect(result.current.isSelecting).toBe(false);
    });

    it('should reset input value after selection', async () => {
      const { result } = renderHook(() => useFilePicker());
      const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      await act(async () => {
        const promise = result.current.pickImage();
        const input = result.current.inputRef.current!;

        Object.defineProperty(input, 'files', {
          value: [testFile],
          configurable: true,
        });

        input.dispatchEvent(new Event('change'));
        await promise;
      });

      const input = result.current.inputRef.current;
      expect(input?.value).toBe('');
    });
  });

  describe('reset', () => {
    it('should remove input from DOM and reset state', async () => {
      const { result } = renderHook(() => useFilePicker());

      // Start a pick to create the input
      act(() => {
        result.current.pickImage();
      });

      expect(result.current.inputRef.current).toBeInstanceOf(HTMLInputElement);

      act(() => {
        result.current.reset();
      });

      expect(removeChildSpy).toHaveBeenCalled();
      expect(result.current.inputRef.current).toBeNull();
      expect(result.current.isSelecting).toBe(false);
    });
  });

  describe('HEIC file detection', () => {
    it('should detect HEIC file by MIME type', async () => {
      const { result } = renderHook(() => useFilePicker());
      const heicFile = new File(['test'], 'photo.jpg', { type: 'image/heic' });
      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

      await act(async () => {
        const promise = result.current.pickImage();
        const input = result.current.inputRef.current!;

        Object.defineProperty(input, 'files', {
          value: [heicFile],
          configurable: true,
        });

        input.dispatchEvent(new Event('change'));
        await promise;
      });

      expect(consoleSpy).toHaveBeenCalledWith('[useFilePicker] HEIC file detected:', 'photo.jpg');
      consoleSpy.mockRestore();
    });

    it('should detect HEIC file by extension', async () => {
      const { result } = renderHook(() => useFilePicker());
      const heicFile = new File(['test'], 'photo.HEIC', { type: 'application/octet-stream' });
      const consoleSpy = vi.spyOn(console, 'debug').mockImplementation(() => {});

      await act(async () => {
        const promise = result.current.pickImage();
        const input = result.current.inputRef.current!;

        Object.defineProperty(input, 'files', {
          value: [heicFile],
          configurable: true,
        });

        input.dispatchEvent(new Event('change'));
        await promise;
      });

      expect(consoleSpy).toHaveBeenCalledWith('[useFilePicker] HEIC file detected:', 'photo.HEIC');
      consoleSpy.mockRestore();
    });
  });

  describe('reuse of input element', () => {
    it('should reuse same input element on multiple picks', async () => {
      const { result } = renderHook(() => useFilePicker());
      const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });

      // First pick
      await act(async () => {
        const promise = result.current.pickImage();
        const input = result.current.inputRef.current!;

        Object.defineProperty(input, 'files', {
          value: [testFile],
          configurable: true,
        });

        input.dispatchEvent(new Event('change'));
        await promise;
      });

      const firstInput = result.current.inputRef.current;

      // Second pick
      await act(async () => {
        const promise = result.current.pickImage();
        const input = result.current.inputRef.current!;

        Object.defineProperty(input, 'files', {
          value: [testFile],
          configurable: true,
        });

        input.dispatchEvent(new Event('change'));
        await promise;
      });

      const secondInput = result.current.inputRef.current;

      // Should be the same input element
      expect(firstInput).toBe(secondInput);
    });
  });
});
