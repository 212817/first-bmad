// apps/web/src/services/image/imageProcessor.service.ts
import type { CompressionOptions, ProcessingResult, ImageProcessorService } from './types';
import { DEFAULT_COMPRESSION_OPTIONS } from './types';

/**
 * Load a blob as an ImageBitmap
 */
const loadImage = async (blob: Blob): Promise<ImageBitmap> => {
  return createImageBitmap(blob);
};

/**
 * Calculate new dimensions maintaining aspect ratio
 */
const calculateDimensions = (
  width: number,
  height: number,
  maxDimension: number
): { width: number; height: number } => {
  if (width <= maxDimension && height <= maxDimension) {
    return { width, height };
  }

  const ratio = Math.min(maxDimension / width, maxDimension / height);
  return {
    width: Math.round(width * ratio),
    height: Math.round(height * ratio),
  };
};

/**
 * Draw image to canvas with specified dimensions
 */
const drawToCanvas = (img: ImageBitmap, width: number, height: number): HTMLCanvasElement => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas 2D context');
  }

  ctx.drawImage(img, 0, 0, width, height);
  return canvas;
};

/**
 * Convert canvas to blob with specified quality
 */
const canvasToBlob = (canvas: HTMLCanvasElement, quality: number): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to convert canvas to blob'));
        }
      },
      'image/jpeg',
      quality
    );
  });
};

/**
 * Image processor service for compression and EXIF stripping
 */
export const imageProcessor: ImageProcessorService = {
  /**
   * Compress an image to the specified maximum size
   * Uses iterative quality reduction to meet size target
   */
  compressImage: async (
    blob: Blob,
    options: CompressionOptions = {}
  ): Promise<ProcessingResult> => {
    const opts = { ...DEFAULT_COMPRESSION_OPTIONS, ...options };
    const { maxSizeKB, maxDimension, initialQuality, minQuality, qualityStep } = opts;

    const img = await loadImage(blob);
    const { width, height } = calculateDimensions(img.width, img.height, maxDimension);
    const canvas = drawToCanvas(img, width, height);

    // Clean up the ImageBitmap
    img.close();

    const maxSizeBytes = maxSizeKB * 1024;
    let quality = initialQuality;
    let result: Blob;

    // Iteratively reduce quality until size is under limit
    do {
      result = await canvasToBlob(canvas, quality);
      quality -= qualityStep;
    } while (result.size > maxSizeBytes && quality >= minQuality);

    // If still over size at minimum quality, accept it
    // (this handles edge cases with very detailed images)

    return {
      blob: result,
      width,
      height,
      originalSize: blob.size,
      compressedSize: result.size,
    };
  },

  /**
   * Strip EXIF metadata from an image by re-encoding through canvas
   * Canvas API automatically strips all metadata when drawing
   */
  stripExifData: async (blob: Blob): Promise<Blob> => {
    const img = await loadImage(blob);

    // Draw at original dimensions to preserve quality
    const canvas = drawToCanvas(img, img.width, img.height);

    // Clean up the ImageBitmap
    img.close();

    // Re-encode at maximum quality (1.0) to minimize quality loss
    // while still stripping EXIF
    return canvasToBlob(canvas, 1.0);
  },

  /**
   * Process an image: strip EXIF first, then compress
   * This is the recommended method for user-provided images
   */
  processImage: async (blob: Blob, options: CompressionOptions = {}): Promise<ProcessingResult> => {
    // Strip EXIF first (this also normalizes the image)
    const strippedBlob = await imageProcessor.stripExifData(blob);

    // Then compress to target size
    return imageProcessor.compressImage(strippedBlob, options);
  },
};
