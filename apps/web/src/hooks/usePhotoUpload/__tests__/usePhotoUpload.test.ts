// apps/web/src/hooks/usePhotoUpload/__tests__/usePhotoUpload.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { usePhotoUpload } from '../usePhotoUpload';

// Mock the API client
vi.mock('@/services/api/client', () => ({
  apiClient: {
    post: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock the image processor
vi.mock('@/services/image/imageProcessor.service', () => ({
  imageProcessor: {
    processImage: vi.fn(),
  },
}));

// Mock the guest store
vi.mock('@/stores/guestStore', () => ({
  useGuestStore: {
    getState: vi.fn(() => ({ isGuest: false })),
  },
}));

// Import mocked modules
import { apiClient } from '@/services/api/client';
import { imageProcessor } from '@/services/image/imageProcessor.service';
import { useGuestStore } from '@/stores/guestStore';

describe('usePhotoUpload', () => {
  const mockProcessedBlob = new Blob(['processed'], { type: 'image/jpeg' });
  const mockUploadUrl = 'https://r2.example.com/signed-upload-url';
  const mockPublicUrl = 'https://cdn.example.com/photos/user-123/test.jpg';
  const mockKey = 'photos/user-123/test.jpg';

  // Store original XMLHttpRequest
  const originalXHR = window.XMLHttpRequest;

  // Shared state for XMLHttpRequest mock
  let xhrListeners: Record<string, (() => void)[]>;
  let xhrUploadListeners: Record<string, ((e: ProgressEvent) => void)[]>;
  let xhrStatus: number;
  let xhrOpenMock: ReturnType<typeof vi.fn>;
  let xhrSendMock: ReturnType<typeof vi.fn>;
  let xhrSetRequestHeaderMock: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();

    // Reset XHR state
    xhrListeners = {};
    xhrUploadListeners = {};
    xhrStatus = 200;
    xhrOpenMock = vi.fn();
    xhrSendMock = vi.fn();
    xhrSetRequestHeaderMock = vi.fn();

    // Setup image processor mock
    vi.mocked(imageProcessor.processImage).mockResolvedValue({
      blob: mockProcessedBlob,
      width: 800,
      height: 600,
      originalSize: 500000,
      compressedSize: 150000,
    });

    // Setup API client mock
    vi.mocked(apiClient.post).mockResolvedValue({
      data: {
        success: true,
        data: {
          uploadUrl: mockUploadUrl,
          key: mockKey,
          publicUrl: mockPublicUrl,
          expiresIn: 300,
        },
      },
    });

    vi.mocked(apiClient.delete).mockResolvedValue({ data: { success: true } });

    // Mock XMLHttpRequest as a class
    class MockXMLHttpRequest {
      open = xhrOpenMock;
      send = xhrSendMock;
      setRequestHeader = xhrSetRequestHeaderMock;

      // Status is accessed via getter to allow dynamic changes in tests
      get status() {
        return xhrStatus;
      }

      upload = {
        addEventListener: (event: string, handler: (e: ProgressEvent) => void) => {
          if (!xhrUploadListeners[event]) {
            xhrUploadListeners[event] = [];
          }
          xhrUploadListeners[event].push(handler);
        },
      };

      addEventListener = (event: string, handler: () => void) => {
        if (!xhrListeners[event]) {
          xhrListeners[event] = [];
        }
        xhrListeners[event].push(handler);
      };
    }

    // @ts-expect-error - Mock XMLHttpRequest
    window.XMLHttpRequest = MockXMLHttpRequest;
  });

  // Helper to trigger XHR events
  const triggerXhrLoad = () => {
    xhrListeners.load?.forEach((handler) => handler());
  };

  const triggerXhrProgress = (loaded: number, total: number) => {
    xhrUploadListeners.progress?.forEach((handler) =>
      handler(new ProgressEvent('progress', { loaded, total, lengthComputable: true }))
    );
  };

  const setXhrStatus = (status: number) => {
    xhrStatus = status;
  };

  afterEach(() => {
    window.XMLHttpRequest = originalXHR;
  });

  describe('initial state', () => {
    it('should return idle state initially', () => {
      const { result } = renderHook(() => usePhotoUpload());

      expect(result.current.status).toBe('idle');
      expect(result.current.progress).toBe(0);
      expect(result.current.error).toBeNull();
      expect(result.current.result).toBeNull();
    });

    it('should provide uploadPhoto function', () => {
      const { result } = renderHook(() => usePhotoUpload());

      expect(typeof result.current.uploadPhoto).toBe('function');
    });

    it('should provide deletePhoto function', () => {
      const { result } = renderHook(() => usePhotoUpload());

      expect(typeof result.current.deletePhoto).toBe('function');
    });

    it('should provide reset function', () => {
      const { result } = renderHook(() => usePhotoUpload());

      expect(typeof result.current.reset).toBe('function');
    });
  });

  describe('uploadPhoto', () => {
    it('should process image before uploading', async () => {
      const { result } = renderHook(() => usePhotoUpload());
      const inputBlob = new Blob(['test'], { type: 'image/jpeg' });

      // Start upload
      act(() => {
        result.current.uploadPhoto(inputBlob);
      });

      // Wait for XHR to be created and listeners registered
      await waitFor(() => {
        expect(xhrSendMock).toHaveBeenCalled();
      });

      // Trigger successful load
      act(() => {
        triggerXhrLoad();
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(imageProcessor.processImage).toHaveBeenCalledWith(inputBlob);
    });

    it('should request upload URL from API', async () => {
      const { result } = renderHook(() => usePhotoUpload());
      const inputBlob = new Blob(['test'], { type: 'image/jpeg' });

      act(() => {
        result.current.uploadPhoto(inputBlob);
      });

      await waitFor(() => {
        expect(xhrSendMock).toHaveBeenCalled();
      });

      act(() => {
        triggerXhrLoad();
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(apiClient.post).toHaveBeenCalledWith('/v1/photos/upload-url', {
        extension: 'jpg',
        contentType: 'image/jpeg',
      });
    });

    it('should upload to R2 via signed URL', async () => {
      const { result } = renderHook(() => usePhotoUpload());
      const inputBlob = new Blob(['test'], { type: 'image/jpeg' });

      act(() => {
        result.current.uploadPhoto(inputBlob);
      });

      await waitFor(() => {
        expect(xhrSendMock).toHaveBeenCalled();
      });

      act(() => {
        triggerXhrLoad();
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(xhrOpenMock).toHaveBeenCalledWith('PUT', mockUploadUrl);
      expect(xhrSetRequestHeaderMock).toHaveBeenCalledWith('Content-Type', 'image/jpeg');
      expect(xhrSendMock).toHaveBeenCalledWith(mockProcessedBlob);
    });

    it('should return upload result on success', async () => {
      const { result } = renderHook(() => usePhotoUpload());
      const inputBlob = new Blob(['test'], { type: 'image/jpeg' });

      act(() => {
        result.current.uploadPhoto(inputBlob);
      });

      await waitFor(() => {
        expect(xhrSendMock).toHaveBeenCalled();
      });

      act(() => {
        triggerXhrLoad();
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      expect(result.current.result).toEqual({
        photoUrl: mockPublicUrl,
        key: mockKey,
      });
    });

    it('should update progress during upload', async () => {
      const { result } = renderHook(() => usePhotoUpload());
      const inputBlob = new Blob(['test'], { type: 'image/jpeg' });

      act(() => {
        result.current.uploadPhoto(inputBlob);
      });

      // Wait for status to change to uploading (after processing)
      await waitFor(() => {
        expect(result.current.status).toBe('uploading');
      });

      // Trigger progress event
      act(() => {
        triggerXhrProgress(50, 100);
      });

      // Progress should be updated (40 base + 50% of 50 = 65)
      await waitFor(() => {
        expect(result.current.progress).toBeGreaterThan(40);
      });

      // Complete the upload to clean up
      act(() => {
        triggerXhrLoad();
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });
    });

    it('should handle upload error', async () => {
      const { result } = renderHook(() => usePhotoUpload());
      const inputBlob = new Blob(['test'], { type: 'image/jpeg' });

      // Set status to error before upload
      setXhrStatus(500);

      act(() => {
        result.current.uploadPhoto(inputBlob).catch(() => {
          // Expected to throw
        });
      });

      await waitFor(() => {
        expect(xhrSendMock).toHaveBeenCalled();
      });

      act(() => {
        triggerXhrLoad();
      });

      await waitFor(() => {
        expect(result.current.status).toBe('error');
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.error?.code).toBe('UPLOAD_FAILED');
    });
  });

  describe('deletePhoto', () => {
    it('should call API to delete photo', async () => {
      const { result } = renderHook(() => usePhotoUpload());

      await act(async () => {
        await result.current.deletePhoto(mockKey);
      });

      expect(apiClient.delete).toHaveBeenCalledWith(`/v1/photos/${encodeURIComponent(mockKey)}`);
    });

    it('should throw on delete failure', async () => {
      vi.mocked(apiClient.delete).mockRejectedValue(new Error('Delete failed'));

      const { result } = renderHook(() => usePhotoUpload());

      await expect(result.current.deletePhoto(mockKey)).rejects.toEqual({
        code: 'DELETE_FAILED',
        message: 'Delete failed',
      });
    });
  });

  describe('reset', () => {
    it('should reset state to idle', async () => {
      const { result } = renderHook(() => usePhotoUpload());
      const inputBlob = new Blob(['test'], { type: 'image/jpeg' });

      // Trigger upload
      act(() => {
        result.current.uploadPhoto(inputBlob);
      });

      // Wait for XHR to be ready
      await waitFor(() => {
        expect(xhrSendMock).toHaveBeenCalled();
      });

      // Complete upload
      act(() => {
        triggerXhrLoad();
      });

      await waitFor(() => {
        expect(result.current.status).toBe('success');
      });

      // Reset
      act(() => {
        result.current.reset();
      });

      expect(result.current.status).toBe('idle');
      expect(result.current.progress).toBe(0);
      expect(result.current.error).toBeNull();
      expect(result.current.result).toBeNull();
    });
  });

  describe('guest mode', () => {
    beforeEach(() => {
      // Set guest mode
      vi.mocked(useGuestStore.getState).mockReturnValue({ isGuest: true } as ReturnType<
        typeof useGuestStore.getState
      >);
    });

    afterEach(() => {
      // Reset to authenticated mode
      vi.mocked(useGuestStore.getState).mockReturnValue({ isGuest: false } as ReturnType<
        typeof useGuestStore.getState
      >);
    });

    it('should store photo locally as base64 in guest mode', async () => {
      const { result } = renderHook(() => usePhotoUpload());
      const inputBlob = new Blob(['test'], { type: 'image/jpeg' });

      await act(async () => {
        await result.current.uploadPhoto(inputBlob);
      });

      // Should not call API for upload URL
      expect(apiClient.post).not.toHaveBeenCalled();

      // Should return data URL
      expect(result.current.status).toBe('success');
      expect(result.current.result?.photoUrl).toMatch(/^data:image\/jpeg;base64,/);
      expect(result.current.result?.key).toMatch(/^local-photo-/);
    });

    it('should compress to smaller size (100KB) for guest mode', async () => {
      const { result } = renderHook(() => usePhotoUpload());
      const inputBlob = new Blob(['test'], { type: 'image/jpeg' });

      await act(async () => {
        await result.current.uploadPhoto(inputBlob);
      });

      // Should call processImage twice: once for initial processing, once for guest compression
      expect(imageProcessor.processImage).toHaveBeenCalledTimes(2);

      // Second call should have smaller maxSizeKB for guest storage
      expect(imageProcessor.processImage).toHaveBeenNthCalledWith(2, mockProcessedBlob, {
        maxSizeKB: 100,
        maxDimension: 800,
        initialQuality: 0.7,
      });
    });

    it('should generate unique local key for each upload', async () => {
      const { result } = renderHook(() => usePhotoUpload());
      const inputBlob = new Blob(['test'], { type: 'image/jpeg' });

      let firstKey: string | undefined;
      let secondKey: string | undefined;

      await act(async () => {
        const result1 = await result.current.uploadPhoto(inputBlob);
        firstKey = result1.key;
      });

      result.current.reset();

      await act(async () => {
        const result2 = await result.current.uploadPhoto(inputBlob);
        secondKey = result2.key;
      });

      expect(firstKey).toMatch(/^local-photo-/);
      expect(secondKey).toMatch(/^local-photo-/);
      expect(firstKey).not.toBe(secondKey);
    });

    it('should not call API delete for local photos', async () => {
      const { result } = renderHook(() => usePhotoUpload());
      const localKey = 'local-photo-123456-abc';

      await act(async () => {
        await result.current.deletePhoto(localKey);
      });

      expect(apiClient.delete).not.toHaveBeenCalled();
    });

    it('should still call API delete for non-local photos in guest mode', async () => {
      const { result } = renderHook(() => usePhotoUpload());
      const remoteKey = 'photos/user-123/test.jpg';

      await act(async () => {
        await result.current.deletePhoto(remoteKey);
      });

      expect(apiClient.delete).toHaveBeenCalledWith(`/v1/photos/${encodeURIComponent(remoteKey)}`);
    });
  });
});
