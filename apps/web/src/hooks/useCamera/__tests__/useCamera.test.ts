// apps/web/src/hooks/useCamera/__tests__/useCamera.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useCamera } from '../useCamera';

describe('useCamera', () => {
  const mockStream = {
    getTracks: vi.fn(() => [{ stop: vi.fn() }]),
  };

  const mockMediaDevices = {
    getUserMedia: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup navigator.mediaDevices mock
    Object.defineProperty(navigator, 'mediaDevices', {
      value: mockMediaDevices,
      writable: true,
      configurable: true,
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should return initial state with no stream', () => {
      const { result } = renderHook(() => useCamera());

      expect(result.current.stream).toBeNull();
      expect(result.current.isActive).toBe(false);
      expect(result.current.error).toBeNull();
      expect(result.current.permissionState).toBe('prompt');
      expect(result.current.facingMode).toBe('environment');
    });

    it('should provide videoRef', () => {
      const { result } = renderHook(() => useCamera());

      expect(result.current.videoRef).toBeDefined();
      expect(result.current.videoRef.current).toBeNull();
    });

    it('should provide all required functions', () => {
      const { result } = renderHook(() => useCamera());

      expect(typeof result.current.startCamera).toBe('function');
      expect(typeof result.current.capturePhoto).toBe('function');
      expect(typeof result.current.stopCamera).toBe('function');
      expect(typeof result.current.switchCamera).toBe('function');
    });
  });

  describe('startCamera', () => {
    it('should request camera with default options', async () => {
      mockMediaDevices.getUserMedia.mockResolvedValue(mockStream);

      const { result } = renderHook(() => useCamera());

      await act(async () => {
        await result.current.startCamera();
      });

      expect(mockMediaDevices.getUserMedia).toHaveBeenCalledWith({
        video: {
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      });
    });

    it('should request camera with custom options', async () => {
      mockMediaDevices.getUserMedia.mockResolvedValue(mockStream);

      const { result } = renderHook(() => useCamera());

      await act(async () => {
        await result.current.startCamera({
          facingMode: 'user',
          width: 1920,
          height: 1080,
        });
      });

      expect(mockMediaDevices.getUserMedia).toHaveBeenCalledWith({
        video: {
          facingMode: 'user',
          width: { ideal: 1920 },
          height: { ideal: 1080 },
        },
        audio: false,
      });
    });

    it('should update state on success', async () => {
      mockMediaDevices.getUserMedia.mockResolvedValue(mockStream);

      const { result } = renderHook(() => useCamera());

      await act(async () => {
        await result.current.startCamera();
      });

      expect(result.current.stream).toBe(mockStream);
      expect(result.current.isActive).toBe(true);
      expect(result.current.error).toBeNull();
      expect(result.current.permissionState).toBe('granted');
    });

    it('should handle permission denied error', async () => {
      const permissionError = new DOMException('Permission denied', 'NotAllowedError');
      mockMediaDevices.getUserMedia.mockRejectedValue(permissionError);

      const { result } = renderHook(() => useCamera());

      await act(async () => {
        try {
          await result.current.startCamera();
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.stream).toBeNull();
      expect(result.current.isActive).toBe(false);
      expect(result.current.error).toEqual({
        code: 'PERMISSION_DENIED',
        message: 'Camera access was denied. Please allow camera access in your browser settings.',
      });
      expect(result.current.permissionState).toBe('denied');
    });

    it('should handle camera not found error', async () => {
      const notFoundError = new DOMException('No camera found', 'NotFoundError');
      mockMediaDevices.getUserMedia.mockRejectedValue(notFoundError);

      const { result } = renderHook(() => useCamera());

      await act(async () => {
        try {
          await result.current.startCamera();
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.error?.code).toBe('NOT_FOUND');
      expect(result.current.permissionState).toBe('prompt');
    });

    it('should handle camera in use error', async () => {
      const notReadableError = new DOMException('Camera in use', 'NotReadableError');
      mockMediaDevices.getUserMedia.mockRejectedValue(notReadableError);

      const { result } = renderHook(() => useCamera());

      await act(async () => {
        try {
          await result.current.startCamera();
        } catch {
          // Expected to throw
        }
      });

      expect(result.current.error?.code).toBe('NOT_READABLE');
    });

    it('should throw when mediaDevices not supported', async () => {
      Object.defineProperty(navigator, 'mediaDevices', {
        value: undefined,
        writable: true,
        configurable: true,
      });

      const { result } = renderHook(() => useCamera());

      await act(async () => {
        await expect(result.current.startCamera()).rejects.toThrow(
          'Camera is not supported in this browser.'
        );
      });

      expect(result.current.error?.code).toBe('NOT_SUPPORTED');
    });

    it('should stop existing stream before starting new one', async () => {
      const mockTrack = { stop: vi.fn() };
      const existingStream = { getTracks: () => [mockTrack] };
      mockMediaDevices.getUserMedia
        .mockResolvedValueOnce(existingStream)
        .mockResolvedValueOnce(mockStream);

      const { result } = renderHook(() => useCamera());

      await act(async () => {
        await result.current.startCamera();
      });

      await act(async () => {
        await result.current.startCamera({ facingMode: 'user' });
      });

      expect(mockTrack.stop).toHaveBeenCalled();
    });
  });

  describe('stopCamera', () => {
    it('should stop all tracks and clear state', async () => {
      const mockTrack = { stop: vi.fn() };
      const streamWithTrack = { getTracks: () => [mockTrack] };
      mockMediaDevices.getUserMedia.mockResolvedValue(streamWithTrack);

      const { result } = renderHook(() => useCamera());

      await act(async () => {
        await result.current.startCamera();
      });

      act(() => {
        result.current.stopCamera();
      });

      expect(mockTrack.stop).toHaveBeenCalled();
      expect(result.current.stream).toBeNull();
      expect(result.current.isActive).toBe(false);
    });

    it('should handle multiple stops gracefully', async () => {
      mockMediaDevices.getUserMedia.mockResolvedValue(mockStream);

      const { result } = renderHook(() => useCamera());

      await act(async () => {
        await result.current.startCamera();
      });

      act(() => {
        result.current.stopCamera();
        result.current.stopCamera(); // Should not throw
      });

      expect(result.current.isActive).toBe(false);
    });
  });

  describe('capturePhoto', () => {
    it('should throw if camera is not active', async () => {
      const { result } = renderHook(() => useCamera());

      await act(async () => {
        await expect(result.current.capturePhoto()).rejects.toThrow(
          'Camera is not active. Start the camera first.'
        );
      });
    });

    it('should capture photo from video stream', async () => {
      mockMediaDevices.getUserMedia.mockResolvedValue(mockStream);

      // Mock video element with proper dimensions
      const mockVideoElement = {
        videoWidth: 640,
        videoHeight: 480,
        readyState: 4, // HAVE_ENOUGH_DATA
        HAVE_CURRENT_DATA: 2,
      };

      // Mock canvas and context
      const mockBlob = new Blob(['test'], { type: 'image/jpeg' });
      const mockCtx = {
        drawImage: vi.fn(),
      };

      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => mockCtx),
        toBlob: vi.fn((callback) => callback(mockBlob)),
      };

      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'canvas') {
          return mockCanvas as unknown as HTMLCanvasElement;
        }
        return originalCreateElement(tag);
      });

      const { result } = renderHook(() => useCamera());

      // Manually set the videoRef
      (result.current.videoRef as { current: typeof mockVideoElement }).current = mockVideoElement;

      await act(async () => {
        await result.current.startCamera();
      });

      let capturedBlob: Blob | undefined;
      await act(async () => {
        capturedBlob = await result.current.capturePhoto();
      });

      expect(mockCanvas.getContext).toHaveBeenCalledWith('2d');
      expect(mockCtx.drawImage).toHaveBeenCalledWith(mockVideoElement, 0, 0);
      expect(capturedBlob).toBe(mockBlob);
    });

    it('should throw if video not ready', async () => {
      mockMediaDevices.getUserMedia.mockResolvedValue(mockStream);

      const mockVideoElement = {
        videoWidth: 0,
        videoHeight: 0,
        readyState: 0, // HAVE_NOTHING
        HAVE_CURRENT_DATA: 2,
      };

      const { result } = renderHook(() => useCamera());

      (result.current.videoRef as { current: typeof mockVideoElement }).current = mockVideoElement;

      await act(async () => {
        await result.current.startCamera();
      });

      await act(async () => {
        await expect(result.current.capturePhoto()).rejects.toThrow(
          'Video stream is not ready yet.'
        );
      });
    });
  });

  describe('switchCamera', () => {
    it('should toggle between front and back camera', async () => {
      mockMediaDevices.getUserMedia.mockResolvedValue(mockStream);

      const { result } = renderHook(() => useCamera());

      await act(async () => {
        await result.current.startCamera({ facingMode: 'environment' });
      });

      expect(result.current.facingMode).toBe('environment');

      await act(async () => {
        await result.current.switchCamera();
      });

      await waitFor(() => {
        expect(result.current.facingMode).toBe('user');
      });
    });

    it('should toggle from front to back camera', async () => {
      mockMediaDevices.getUserMedia.mockResolvedValue(mockStream);

      const { result } = renderHook(() => useCamera());

      await act(async () => {
        await result.current.startCamera({ facingMode: 'user' });
      });

      await act(async () => {
        await result.current.switchCamera();
      });

      await waitFor(() => {
        expect(result.current.facingMode).toBe('environment');
      });
    });
  });
});
