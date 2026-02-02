// apps/web/src/hooks/useCamera/types.ts

/**
 * Permission state for camera access
 */
export type CameraPermissionState = 'prompt' | 'granted' | 'denied';

/**
 * Camera facing mode
 */
export type FacingMode = 'user' | 'environment';

/**
 * Camera error
 */
export interface CameraError {
  code: string;
  message: string;
}

/**
 * Camera state
 */
export interface CameraState {
  stream: MediaStream | null;
  isActive: boolean;
  error: CameraError | null;
  permissionState: CameraPermissionState;
  facingMode: FacingMode;
}

/**
 * Camera configuration options
 */
export interface CameraOptions {
  facingMode?: FacingMode;
  width?: number;
  height?: number;
}

/**
 * Default camera options
 */
export const DEFAULT_CAMERA_OPTIONS: Required<CameraOptions> = {
  facingMode: 'environment',
  width: 1280,
  height: 720,
};

/**
 * Camera hook return type
 */
export interface UseCameraReturn extends CameraState {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  startCamera: (options?: CameraOptions) => Promise<MediaStream>;
  capturePhoto: () => Promise<Blob>;
  stopCamera: () => void;
  switchCamera: () => Promise<void>;
}
