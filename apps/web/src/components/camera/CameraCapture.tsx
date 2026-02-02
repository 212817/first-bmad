// apps/web/src/components/camera/CameraCapture.tsx
import { useEffect, useState, useCallback, useRef } from 'react';
import { useCamera } from '@/hooks/useCamera/useCamera';
import type { CameraCaptureProps } from './types';

/**
 * Full-screen camera capture component
 * Uses getUserMedia API for in-browser photo capture
 */
export const CameraCapture = ({
  onCapture,
  onClose,
  isOpen = true,
  onGalleryUpload,
}: CameraCaptureProps) => {
  const {
    videoRef,
    startCamera,
    capturePhoto,
    stopCamera,
    switchCamera,
    permissionState,
    isActive,
    error,
    facingMode,
  } = useCamera();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewBlob, setPreviewBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  // Start camera when opened
  useEffect(() => {
    if (isOpen) {
      startCamera().catch(() => {
        // Error is handled in state
      });
    } else {
      stopCamera();
      setPreviewBlob(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    }

    return () => {
      stopCamera();
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Handle photo capture
  const handleCapture = useCallback(async () => {
    if (isCapturing) return;

    setIsCapturing(true);
    try {
      const blob = await capturePhoto();
      const url = URL.createObjectURL(blob);
      setPreviewBlob(blob);
      setPreviewUrl(url);
    } catch {
      // Error handled silently - user can retry
    } finally {
      setIsCapturing(false);
    }
  }, [capturePhoto, isCapturing]);

  // Handle photo confirmation
  const handleConfirm = useCallback(() => {
    if (previewBlob) {
      onCapture(previewBlob);
      setPreviewBlob(null);
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
        setPreviewUrl(null);
      }
    }
  }, [previewBlob, previewUrl, onCapture]);

  // Handle retake
  const handleRetake = useCallback(() => {
    setPreviewBlob(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
  }, [previewUrl]);

  // Handle close
  const handleClose = useCallback(() => {
    stopCamera();
    setPreviewBlob(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    onClose();
  }, [stopCamera, previewUrl, onClose]);

  // Handle switch camera
  const handleSwitchCamera = useCallback(() => {
    switchCamera().catch(() => {
      // Silent fail - button won't work on single-camera devices
    });
  }, [switchCamera]);

  // Handle gallery upload button click
  const handleGalleryUploadClick = useCallback(() => {
    if (onGalleryUpload) {
      handleClose();
      onGalleryUpload();
    } else {
      // Fallback: open file input
      fileInputRef.current?.click();
    }
  }, [onGalleryUpload, handleClose]);

  // Handle file selection from gallery
  const handleFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file && file.type.startsWith('image/')) {
        onCapture(file);
        handleClose();
      }
      // Reset input for re-selection
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    },
    [onCapture, handleClose]
  );

  if (!isOpen) {
    return null;
  }

  // Permission denied state
  if (permissionState === 'denied') {
    return (
      <div
        className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6"
        data-testid="camera-permission-denied"
      >
        {/* Hidden file input for gallery fallback */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
          data-testid="gallery-file-input"
        />
        <div className="text-white text-center max-w-sm">
          <div className="text-6xl mb-4">📷</div>
          <h2 className="text-xl font-semibold mb-2">Camera Access Denied</h2>
          <p className="text-gray-300 mb-6">
            Please allow camera access in your browser settings to take a photo, or upload an
            existing image from your gallery.
          </p>
          <p className="text-gray-400 text-sm mb-6">
            💡 Tip: A photo helps you remember exactly where you parked, especially in garages!
          </p>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleGalleryUploadClick}
              className="px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-gray-100 transition-colors"
              data-testid="upload-from-gallery-btn"
            >
              📁 Upload from Gallery
            </button>
            <button
              onClick={handleClose}
              className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
              data-testid="cancel-btn"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !isActive) {
    return (
      <div
        className="fixed inset-0 z-50 bg-black flex flex-col items-center justify-center p-6"
        data-testid="camera-error"
      >
        <div className="text-white text-center max-w-sm">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold mb-2">Camera Error</h2>
          <p className="text-gray-300 mb-6">{error.message}</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => startCamera()}
              className="px-6 py-3 bg-white text-black rounded-full font-medium hover:bg-gray-100 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={handleClose}
              className="px-6 py-3 text-gray-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Preview state
  if (previewBlob && previewUrl) {
    return (
      <div className="fixed inset-0 z-50 bg-black flex flex-col" data-testid="camera-preview">
        {/* Preview image */}
        <div className="flex-1 flex items-center justify-center overflow-hidden">
          <img
            src={previewUrl}
            alt="Captured photo preview"
            className="max-w-full max-h-full object-contain"
          />
        </div>

        {/* Action buttons */}
        <div className="absolute bottom-0 left-0 right-0 p-6 pb-safe">
          <div className="flex justify-center gap-4">
            <button
              onClick={handleRetake}
              className="px-8 py-3 bg-gray-800 text-white rounded-full font-medium hover:bg-gray-700 transition-colors"
              data-testid="retake-btn"
            >
              Retake
            </button>
            <button
              onClick={handleConfirm}
              className="px-8 py-3 bg-white text-black rounded-full font-medium hover:bg-gray-100 transition-colors"
              data-testid="confirm-photo-btn"
            >
              Use Photo
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Camera capture view
  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col" data-testid="camera-capture">
      {/* Close button */}
      <button
        onClick={handleClose}
        className="absolute top-4 left-4 z-10 w-10 h-10 flex items-center justify-center bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
        aria-label="Close camera"
        data-testid="close-camera-btn"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>

      {/* Switch camera button */}
      <button
        onClick={handleSwitchCamera}
        className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-black/50 rounded-full text-white hover:bg-black/70 transition-colors"
        aria-label={`Switch to ${facingMode === 'environment' ? 'front' : 'back'} camera`}
        data-testid="switch-camera-btn"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
          />
        </svg>
      </button>

      {/* Video preview */}
      <div className="flex-1 flex items-center justify-center overflow-hidden">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className={`max-w-full max-h-full object-contain ${
            facingMode === 'user' ? 'scale-x-[-1]' : ''
          }`}
          data-testid="camera-video"
        />
      </div>

      {/* Capture button */}
      <div className="absolute bottom-0 left-0 right-0 p-6 pb-safe flex justify-center">
        <button
          onClick={handleCapture}
          disabled={!isActive || isCapturing}
          className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center transition-all ${
            isCapturing
              ? 'bg-gray-400'
              : isActive
                ? 'bg-white/20 hover:bg-white/30 active:scale-95'
                : 'bg-gray-600 cursor-not-allowed'
          }`}
          aria-label="Capture photo"
          data-testid="capture-btn"
        >
          <div className={`w-16 h-16 rounded-full ${isCapturing ? 'bg-gray-500' : 'bg-white'}`} />
        </button>
      </div>
    </div>
  );
};
