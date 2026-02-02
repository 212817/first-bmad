// apps/web/src/services/image/__tests__/imageProcessor.service.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { imageProcessor } from '../imageProcessor.service';

describe('imageProcessor', () => {
  // Mock ImageBitmap with close method
  const createMockImageBitmap = (width: number, height: number) => ({
    width,
    height,
    close: vi.fn(),
  });

  // Helper to create a test blob
  const createTestBlob = (sizeKB: number = 500): Blob => {
    // Create a blob of approximate size
    const data = new Array(sizeKB * 1024).fill('x').join('');
    return new Blob([data], { type: 'image/jpeg' });
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock createImageBitmap
    vi.stubGlobal(
      'createImageBitmap',
      vi.fn().mockResolvedValue(createMockImageBitmap(1920, 1080))
    );
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  describe('compressImage', () => {
    it('should compress image to target size', async () => {
      const inputBlob = createTestBlob(500);
      const targetSizeKB = 200;

      // Mock canvas
      const mockCtx = { drawImage: vi.fn() };
      const outputBlob = new Blob(['compressed'], { type: 'image/jpeg' });

      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => mockCtx),
        toBlob: vi.fn((callback) => callback(outputBlob)),
      };

      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'canvas') {
          return mockCanvas as unknown as HTMLCanvasElement;
        }
        return originalCreateElement(tag);
      });

      const result = await imageProcessor.compressImage(inputBlob, {
        maxSizeKB: targetSizeKB,
      });

      expect(result.blob).toBe(outputBlob);
      expect(result.originalSize).toBe(inputBlob.size);
      expect(result.compressedSize).toBe(outputBlob.size);
    });

    it('should resize images larger than maxDimension', async () => {
      const inputBlob = createTestBlob(500);

      // Mock large image
      vi.stubGlobal(
        'createImageBitmap',
        vi.fn().mockResolvedValue(createMockImageBitmap(2400, 1600))
      );

      const mockCtx = { drawImage: vi.fn() };
      const outputBlob = new Blob(['compressed'], { type: 'image/jpeg' });

      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => mockCtx),
        toBlob: vi.fn((callback) => callback(outputBlob)),
      };

      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'canvas') {
          return mockCanvas as unknown as HTMLCanvasElement;
        }
        return originalCreateElement(tag);
      });

      const result = await imageProcessor.compressImage(inputBlob, {
        maxDimension: 1200,
      });

      // Check dimensions were scaled down (1200/2400 = 0.5 ratio)
      expect(result.width).toBe(1200);
      expect(result.height).toBe(800);
    });

    it('should not resize images smaller than maxDimension', async () => {
      const inputBlob = createTestBlob(100);

      vi.stubGlobal(
        'createImageBitmap',
        vi.fn().mockResolvedValue(createMockImageBitmap(800, 600))
      );

      const mockCtx = { drawImage: vi.fn() };
      const outputBlob = new Blob(['compressed'], { type: 'image/jpeg' });

      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => mockCtx),
        toBlob: vi.fn((callback) => callback(outputBlob)),
      };

      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'canvas') {
          return mockCanvas as unknown as HTMLCanvasElement;
        }
        return originalCreateElement(tag);
      });

      const result = await imageProcessor.compressImage(inputBlob, {
        maxDimension: 1200,
      });

      expect(result.width).toBe(800);
      expect(result.height).toBe(600);
    });

    it('should iterate quality reduction until target size met', async () => {
      const inputBlob = createTestBlob(500);

      const mockCtx = { drawImage: vi.fn() };

      // Simulate progressive compression - first call returns large blob, subsequent smaller
      let callCount = 0;
      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => mockCtx),
        toBlob: vi.fn((callback) => {
          callCount++;
          // First two calls return large blob, third returns small
          const size = callCount <= 2 ? 300 * 1024 : 150 * 1024;
          const blob = new Blob([new Array(size).fill('x').join('')], {
            type: 'image/jpeg',
          });
          callback(blob);
        }),
      };

      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'canvas') {
          return mockCanvas as unknown as HTMLCanvasElement;
        }
        return originalCreateElement(tag);
      });

      const result = await imageProcessor.compressImage(inputBlob, {
        maxSizeKB: 200,
        initialQuality: 0.8,
        qualityStep: 0.1,
      });

      // Should have called toBlob multiple times
      expect(mockCanvas.toBlob).toHaveBeenCalledTimes(3);
      expect(result.compressedSize).toBeLessThan(200 * 1024);
    });

    it('should close ImageBitmap after processing', async () => {
      const inputBlob = createTestBlob(100);

      const mockBitmap = createMockImageBitmap(800, 600);
      vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue(mockBitmap));

      const mockCtx = { drawImage: vi.fn() };
      const outputBlob = new Blob(['compressed'], { type: 'image/jpeg' });

      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => mockCtx),
        toBlob: vi.fn((callback) => callback(outputBlob)),
      };

      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'canvas') {
          return mockCanvas as unknown as HTMLCanvasElement;
        }
        return originalCreateElement(tag);
      });

      await imageProcessor.compressImage(inputBlob);

      expect(mockBitmap.close).toHaveBeenCalled();
    });

    it('should throw if canvas context is not available', async () => {
      const inputBlob = createTestBlob(100);

      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => null),
      };

      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'canvas') {
          return mockCanvas as unknown as HTMLCanvasElement;
        }
        return originalCreateElement(tag);
      });

      await expect(imageProcessor.compressImage(inputBlob)).rejects.toThrow(
        'Failed to get canvas 2D context'
      );
    });
  });

  describe('stripExifData', () => {
    it('should re-encode image at original dimensions', async () => {
      const inputBlob = createTestBlob(100);

      vi.stubGlobal(
        'createImageBitmap',
        vi.fn().mockResolvedValue(createMockImageBitmap(1600, 900))
      );

      const mockCtx = { drawImage: vi.fn() };
      const outputBlob = new Blob(['stripped'], { type: 'image/jpeg' });

      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => mockCtx),
        toBlob: vi.fn((callback, type, quality) => {
          // Verify quality is 1.0 for EXIF stripping
          expect(quality).toBe(1.0);
          callback(outputBlob);
        }),
      };

      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'canvas') {
          return mockCanvas as unknown as HTMLCanvasElement;
        }
        return originalCreateElement(tag);
      });

      const result = await imageProcessor.stripExifData(inputBlob);

      expect(result).toBe(outputBlob);
      // Canvas dimensions should match original image
      expect(mockCanvas.width).toBe(1600);
      expect(mockCanvas.height).toBe(900);
    });

    it('should close ImageBitmap after stripping', async () => {
      const inputBlob = createTestBlob(100);

      const mockBitmap = createMockImageBitmap(800, 600);
      vi.stubGlobal('createImageBitmap', vi.fn().mockResolvedValue(mockBitmap));

      const mockCtx = { drawImage: vi.fn() };
      const outputBlob = new Blob(['stripped'], { type: 'image/jpeg' });

      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => mockCtx),
        toBlob: vi.fn((callback) => callback(outputBlob)),
      };

      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'canvas') {
          return mockCanvas as unknown as HTMLCanvasElement;
        }
        return originalCreateElement(tag);
      });

      await imageProcessor.stripExifData(inputBlob);

      expect(mockBitmap.close).toHaveBeenCalled();
    });
  });

  describe('processImage', () => {
    it('should strip EXIF and then compress', async () => {
      const inputBlob = createTestBlob(500);

      const mockCtx = { drawImage: vi.fn() };
      const strippedBlob = new Blob(['stripped'], { type: 'image/jpeg' });
      const compressedBlob = new Blob(['compressed'], { type: 'image/jpeg' });

      let callCount = 0;
      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => mockCtx),
        toBlob: vi.fn((callback) => {
          callCount++;
          // First call is stripExifData, second is compressImage
          callback(callCount === 1 ? strippedBlob : compressedBlob);
        }),
      };

      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'canvas') {
          return mockCanvas as unknown as HTMLCanvasElement;
        }
        return originalCreateElement(tag);
      });

      const result = await imageProcessor.processImage(inputBlob);

      // Should have called both stripExifData and compressImage
      expect(mockCanvas.toBlob).toHaveBeenCalledTimes(2);
      expect(result.blob).toBe(compressedBlob);
    });

    it('should pass compression options to compressImage', async () => {
      const inputBlob = createTestBlob(500);

      vi.stubGlobal(
        'createImageBitmap',
        vi.fn().mockResolvedValue(createMockImageBitmap(2000, 1500))
      );

      const mockCtx = { drawImage: vi.fn() };
      const outputBlob = new Blob(['processed'], { type: 'image/jpeg' });

      const mockCanvas = {
        width: 0,
        height: 0,
        getContext: vi.fn(() => mockCtx),
        toBlob: vi.fn((callback) => callback(outputBlob)),
      };

      const originalCreateElement = document.createElement.bind(document);
      vi.spyOn(document, 'createElement').mockImplementation((tag) => {
        if (tag === 'canvas') {
          return mockCanvas as unknown as HTMLCanvasElement;
        }
        return originalCreateElement(tag);
      });

      const result = await imageProcessor.processImage(inputBlob, {
        maxDimension: 800,
        maxSizeKB: 100,
      });

      // Should have scaled down based on custom maxDimension
      expect(result.width).toBeLessThanOrEqual(800);
      expect(result.height).toBeLessThanOrEqual(800);
    });
  });
});
