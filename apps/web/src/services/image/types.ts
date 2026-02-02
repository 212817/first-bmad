// apps/web/src/services/image/types.ts

/**
 * Image compression options
 */
export interface CompressionOptions {
  /** Maximum output size in KB (default: 200) */
  maxSizeKB?: number;
  /** Maximum dimension for width or height (default: 1200) */
  maxDimension?: number;
  /** Initial JPEG quality (default: 0.8) */
  initialQuality?: number;
  /** Minimum JPEG quality (default: 0.1) */
  minQuality?: number;
  /** Quality reduction step (default: 0.1) */
  qualityStep?: number;
}

/**
 * Default compression options
 */
export const DEFAULT_COMPRESSION_OPTIONS: Required<CompressionOptions> = {
  maxSizeKB: 200,
  maxDimension: 1200,
  initialQuality: 0.8,
  minQuality: 0.1,
  qualityStep: 0.1,
};

/**
 * Guest mode compression options (smaller for IndexedDB storage)
 */
export const GUEST_COMPRESSION_OPTIONS: Required<CompressionOptions> = {
  maxSizeKB: 100,
  maxDimension: 800,
  initialQuality: 0.7,
  minQuality: 0.1,
  qualityStep: 0.1,
};

/**
 * Image processing result
 */
export interface ProcessingResult {
  blob: Blob;
  width: number;
  height: number;
  originalSize: number;
  compressedSize: number;
}

/**
 * Image processor service interface
 */
export interface ImageProcessorService {
  /**
   * Compress an image to the specified maximum size
   */
  compressImage: (blob: Blob, options?: CompressionOptions) => Promise<ProcessingResult>;

  /**
   * Strip EXIF metadata from an image
   */
  stripExifData: (blob: Blob) => Promise<Blob>;

  /**
   * Process an image: strip EXIF and compress
   */
  processImage: (blob: Blob, options?: CompressionOptions) => Promise<ProcessingResult>;
}
