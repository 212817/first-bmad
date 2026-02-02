// apps/web/src/hooks/useCamera/useCamera.ts
import { useRef, useState, useCallback } from 'react';
import type {
  CameraState,
  CameraError,
  CameraOptions,
  FacingMode,
  UseCameraReturn,
  CameraPermissionState,
} from './types';
import { DEFAULT_CAMERA_OPTIONS } from './types';

/**
 * Get user-friendly error message from camera error
 */
const getErrorMessage = (error: unknown): CameraError => {
  if (error instanceof DOMException) {
    switch (error.name) {
      case 'NotAllowedError':
        return {
          code: 'PERMISSION_DENIED',
          message: 'Camera access was denied. Please allow camera access in your browser settings.',
        };
      case 'NotFoundError':
        return {
          code: 'NOT_FOUND',
          message: 'No camera found on this device.',
        };
      case 'NotReadableError':
        return {
          code: 'NOT_READABLE',
          message: 'Camera is already in use by another application.',
        };
      case 'OverconstrainedError':
        return {
          code: 'OVERCONSTRAINED',
          message: 'Camera does not meet the requested constraints.',
        };
      case 'SecurityError':
        return {
          code: 'SECURITY_ERROR',
          message: 'Camera access is not allowed in this context.',
        };
      default:
        return {
          code: 'UNKNOWN',
          message: error.message || 'An unknown camera error occurred.',
        };
    }
  }

  return {
    code: 'UNKNOWN',
    message: error instanceof Error ? error.message : 'An unknown error occurred.',
  };
};

/**
 * Hook for camera capture using getUserMedia API
 * Provides camera stream management, photo capture, and permission handling
 */
export const useCamera = (): UseCameraReturn => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [state, setState] = useState<CameraState>({
    stream: null,
    isActive: false,
    error: null,
    permissionState: 'prompt',
    facingMode: 'environment',
  });

  /**
   * Stop all tracks in the current stream
   */
  const stopCamera = useCallback(() => {
    if (state.stream) {
      state.stream.getTracks().forEach((track) => track.stop());
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setState((s) => ({
      ...s,
      stream: null,
      isActive: false,
    }));
  }, [state.stream]);

  /**
   * Start camera with specified options
   */
  const startCamera = useCallback(
    async (options: CameraOptions = {}): Promise<MediaStream> => {
      // Check if getUserMedia is supported
      if (!navigator.mediaDevices?.getUserMedia) {
        const error: CameraError = {
          code: 'NOT_SUPPORTED',
          message: 'Camera is not supported in this browser.',
        };
        setState((s) => ({ ...s, error, permissionState: 'denied' }));
        throw new Error(error.message);
      }

      // Stop any existing stream
      if (state.stream) {
        state.stream.getTracks().forEach((track) => track.stop());
      }

      const mergedOptions = { ...DEFAULT_CAMERA_OPTIONS, ...options };

      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: mergedOptions.facingMode,
            width: { ideal: mergedOptions.width },
            height: { ideal: mergedOptions.height },
          },
          audio: false,
        });

        // Set video source
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }

        setState((s) => ({
          ...s,
          stream: mediaStream,
          isActive: true,
          error: null,
          permissionState: 'granted',
          facingMode: mergedOptions.facingMode,
        }));

        return mediaStream;
      } catch (err) {
        const error = getErrorMessage(err);
        const permissionState: CameraPermissionState =
          error.code === 'PERMISSION_DENIED' ? 'denied' : 'prompt';

        setState((s) => ({
          ...s,
          stream: null,
          isActive: false,
          error,
          permissionState,
        }));

        throw new Error(error.message);
      }
    },
    [state.stream]
  );

  /**
   * Capture a photo from the current video stream
   */
  const capturePhoto = useCallback(async (): Promise<Blob> => {
    const video = videoRef.current;

    if (!video || !state.isActive) {
      throw new Error('Camera is not active. Start the camera first.');
    }

    // Wait for video to be ready
    if (video.readyState < video.HAVE_CURRENT_DATA) {
      throw new Error('Video stream is not ready yet.');
    }

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context.');
    }

    ctx.drawImage(video, 0, 0);

    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(blob);
          } else {
            reject(new Error('Failed to capture photo.'));
          }
        },
        'image/jpeg',
        0.9
      );
    });
  }, [state.isActive]);

  /**
   * Switch between front and back camera
   */
  const switchCamera = useCallback(async (): Promise<void> => {
    const newFacingMode: FacingMode = state.facingMode === 'environment' ? 'user' : 'environment';

    await startCamera({ facingMode: newFacingMode });
  }, [state.facingMode, startCamera]);

  return {
    videoRef,
    stream: state.stream,
    isActive: state.isActive,
    error: state.error,
    permissionState: state.permissionState,
    facingMode: state.facingMode,
    startCamera,
    capturePhoto,
    stopCamera,
    switchCamera,
  };
};
