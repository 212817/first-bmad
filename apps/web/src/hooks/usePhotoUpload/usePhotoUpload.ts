// apps/web/src/hooks/usePhotoUpload/usePhotoUpload.ts
import { useState, useCallback } from 'react';
import { apiClient } from '@/services/api/client';
import { imageProcessor } from '@/services/image/imageProcessor.service';
import { useGuestStore } from '@/stores/guestStore';
import type {
  UploadState,
  UploadResult,
  UploadError,
  UsePhotoUploadReturn,
  GetUploadUrlResponse,
} from './types';

const INITIAL_STATE: UploadState = {
  status: 'idle',
  progress: 0,
  error: null,
  result: null,
};

/** Max size for guest mode photos stored in IndexedDB (100KB) */
const GUEST_MAX_SIZE_KB = 100;

/**
 * Hook for uploading photos to R2 storage (authenticated) or storing locally (guest)
 * Handles image processing, signed URL generation, and upload with progress
 */
export const usePhotoUpload = (): UsePhotoUploadReturn => {
  const [state, setState] = useState<UploadState>(INITIAL_STATE);

  /**
   * Reset state to idle
   */
  const reset = useCallback(() => {
    setState(INITIAL_STATE);
  }, []);

  /**
   * Upload photo for authenticated users (R2)
   */
  const uploadToR2 = async (processedBlob: Blob): Promise<UploadResult> => {
    setState((s) => ({ ...s, progress: 30 }));

    // Get signed upload URL from API
    const extension = 'jpg';
    const contentType = 'image/jpeg';

    const urlResponse = await apiClient.post<{ success: true; data: GetUploadUrlResponse }>(
      '/v1/photos/upload-url',
      { extension, contentType }
    );

    if (!urlResponse.data.success) {
      throw new Error('Failed to get upload URL');
    }

    const { uploadUrl, key, publicUrl } = urlResponse.data.data;

    setState((s) => ({ ...s, status: 'uploading', progress: 40 }));

    // Upload to R2 via signed URL using XMLHttpRequest for progress
    await new Promise<void>((resolve, reject) => {
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          // Map 0-100% upload progress to 40-90% overall progress
          const uploadProgress = (event.loaded / event.total) * 50;
          setState((s) => ({ ...s, progress: 40 + uploadProgress }));
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve();
        } else {
          reject(new Error(`Upload failed with status ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Upload failed due to network error'));
      });

      xhr.addEventListener('abort', () => {
        reject(new Error('Upload was aborted'));
      });

      xhr.open('PUT', uploadUrl);
      xhr.setRequestHeader('Content-Type', contentType);
      xhr.send(processedBlob);
    });

    return { photoUrl: publicUrl, key };
  };

  /**
   * Store photo locally for guest users (base64 data URL)
   */
  const storeLocally = async (blob: Blob): Promise<UploadResult> => {
    setState((s) => ({ ...s, progress: 40 }));

    // Compress to smaller size for IndexedDB storage
    const compressedResult = await imageProcessor.processImage(blob, {
      maxSizeKB: GUEST_MAX_SIZE_KB,
      maxDimension: 800, // Smaller dimension for guests
      quality: 0.7,
      format: 'jpeg',
    });

    setState((s) => ({ ...s, progress: 70 }));

    // Convert to base64 data URL for storage
    const reader = new FileReader();
    const dataUrl = await new Promise<string>((resolve, reject) => {
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(new Error('Failed to convert image'));
      reader.readAsDataURL(compressedResult.blob);
    });

    setState((s) => ({ ...s, progress: 90 }));

    // Generate a unique local key
    const localKey = `local-photo-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

    return { photoUrl: dataUrl, key: localKey };
  };

  /**
   * Upload a photo blob
   * For authenticated: Process image → Get signed URL → Upload to R2
   * For guests: Process image → Convert to base64 → Store locally
   */
  const uploadPhoto = useCallback(async (blob: Blob): Promise<UploadResult> => {
    setState({
      status: 'processing',
      progress: 0,
      error: null,
      result: null,
    });

    const isGuest = useGuestStore.getState().isGuest;

    try {
      // Step 1: Process image (strip EXIF, compress)
      setState((s) => ({ ...s, progress: 10 }));
      const processedResult = await imageProcessor.processImage(blob);
      const processedBlob = processedResult.blob;

      setState((s) => ({ ...s, progress: 20 }));

      let result: UploadResult;

      if (isGuest) {
        // Guest mode: store locally as base64
        result = await storeLocally(processedBlob);
      } else {
        // Authenticated: upload to R2
        result = await uploadToR2(processedBlob);
      }

      // Complete
      setState({
        status: 'success',
        progress: 100,
        error: null,
        result,
      });

      return result;
    } catch (err) {
      const error: UploadError = {
        code: 'UPLOAD_FAILED',
        message: err instanceof Error ? err.message : 'Failed to upload photo',
      };

      setState({
        status: 'error',
        progress: 0,
        error,
        result: null,
      });

      throw error;
    }
  }, []);

  /**
   * Delete a previously uploaded photo
   * For guests, photos are stored locally and don't need R2 deletion
   */
  const deletePhoto = useCallback(async (key: string): Promise<void> => {
    // Local photos (guest mode) don't need API deletion
    if (key.startsWith('local-photo-')) {
      return;
    }

    try {
      await apiClient.delete(`/v1/photos/${encodeURIComponent(key)}`);
    } catch (err) {
      const error: UploadError = {
        code: 'DELETE_FAILED',
        message: err instanceof Error ? err.message : 'Failed to delete photo',
      };
      throw error;
    }
  }, []);

  return {
    status: state.status,
    progress: state.progress,
    error: state.error,
    result: state.result,
    uploadPhoto,
    deletePhoto,
    reset,
  };
};
