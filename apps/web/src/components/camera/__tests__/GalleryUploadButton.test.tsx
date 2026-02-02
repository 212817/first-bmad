// apps/web/src/components/camera/__tests__/GalleryUploadButton.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GalleryUploadButton } from '../GalleryUploadButton';

// Mock dependencies
vi.mock('@/hooks/useFilePicker/useFilePicker', () => ({
  useFilePicker: vi.fn(),
}));

vi.mock('@/services/image/imageProcessor.service', () => ({
  imageProcessor: {
    processImage: vi.fn(),
  },
}));

vi.mock('@/hooks/usePhotoUpload/usePhotoUpload', () => ({
  usePhotoUpload: vi.fn(),
}));

import { useFilePicker } from '@/hooks/useFilePicker/useFilePicker';
import { imageProcessor } from '@/services/image/imageProcessor.service';
import { usePhotoUpload } from '@/hooks/usePhotoUpload/usePhotoUpload';

describe('GalleryUploadButton', () => {
  const mockPickImage = vi.fn();
  const mockUploadPhoto = vi.fn();
  const mockOnPhotoUploaded = vi.fn();
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementations
    (useFilePicker as ReturnType<typeof vi.fn>).mockReturnValue({
      pickImage: mockPickImage,
      isSelecting: false,
    });

    (usePhotoUpload as ReturnType<typeof vi.fn>).mockReturnValue({
      uploadPhoto: mockUploadPhoto,
      status: 'idle',
      progress: 0,
    });

    (imageProcessor.processImage as ReturnType<typeof vi.fn>).mockResolvedValue({
      blob: new Blob(['processed'], { type: 'image/jpeg' }),
      width: 800,
      height: 600,
      originalSize: 1000,
      compressedSize: 500,
    });

    mockUploadPhoto.mockResolvedValue({
      photoUrl: 'https://example.com/photo.jpg',
      key: 'photo-123',
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('rendering', () => {
    it('should render with default text', () => {
      render(<GalleryUploadButton onPhotoUploaded={mockOnPhotoUploaded} />);

      expect(screen.getByTestId('gallery-upload-btn')).toBeInTheDocument();
      expect(screen.getByText('Upload from Gallery')).toBeInTheDocument();
    });

    it('should render with secondary variant styles by default', () => {
      render(<GalleryUploadButton onPhotoUploaded={mockOnPhotoUploaded} />);

      const button = screen.getByTestId('gallery-upload-btn');
      expect(button.className).toContain('border');
    });

    it('should render with primary variant styles when specified', () => {
      render(<GalleryUploadButton onPhotoUploaded={mockOnPhotoUploaded} variant="primary" />);

      const button = screen.getByTestId('gallery-upload-btn');
      expect(button.className).toContain('bg-indigo-600');
    });

    it('should apply custom className', () => {
      render(
        <GalleryUploadButton onPhotoUploaded={mockOnPhotoUploaded} className="custom-class" />
      );

      const button = screen.getByTestId('gallery-upload-btn');
      expect(button.className).toContain('custom-class');
    });

    it('should be disabled when disabled prop is true', () => {
      render(<GalleryUploadButton onPhotoUploaded={mockOnPhotoUploaded} disabled />);

      expect(screen.getByTestId('gallery-upload-btn')).toBeDisabled();
    });
  });

  describe('loading states', () => {
    it('should show Selecting... when isSelecting is true', () => {
      (useFilePicker as ReturnType<typeof vi.fn>).mockReturnValue({
        pickImage: mockPickImage,
        isSelecting: true,
      });

      render(<GalleryUploadButton onPhotoUploaded={mockOnPhotoUploaded} />);

      expect(screen.getByText('Selecting...')).toBeInTheDocument();
      expect(screen.getByTestId('gallery-upload-btn')).toBeDisabled();
    });

    it('should show Uploading... during upload', () => {
      (usePhotoUpload as ReturnType<typeof vi.fn>).mockReturnValue({
        uploadPhoto: mockUploadPhoto,
        status: 'uploading',
        progress: 50,
      });

      render(<GalleryUploadButton onPhotoUploaded={mockOnPhotoUploaded} />);

      expect(screen.getByText('Uploading...')).toBeInTheDocument();
      expect(screen.getByTestId('gallery-upload-btn')).toBeDisabled();
    });

    it('should show progress bar during upload', () => {
      (usePhotoUpload as ReturnType<typeof vi.fn>).mockReturnValue({
        uploadPhoto: mockUploadPhoto,
        status: 'uploading',
        progress: 75,
      });

      render(<GalleryUploadButton onPhotoUploaded={mockOnPhotoUploaded} />);

      expect(screen.getByTestId('upload-progress')).toBeInTheDocument();
      expect(screen.getByText('75%')).toBeInTheDocument();
    });
  });

  describe('upload flow', () => {
    it('should call pickImage when clicked', async () => {
      mockPickImage.mockResolvedValue(new File(['test'], 'test.jpg', { type: 'image/jpeg' }));

      render(<GalleryUploadButton onPhotoUploaded={mockOnPhotoUploaded} />);

      fireEvent.click(screen.getByTestId('gallery-upload-btn'));

      await waitFor(() => {
        expect(mockPickImage).toHaveBeenCalled();
      });
    });

    it('should not proceed if user cancels file selection', async () => {
      mockPickImage.mockResolvedValue(null);

      render(<GalleryUploadButton onPhotoUploaded={mockOnPhotoUploaded} />);

      fireEvent.click(screen.getByTestId('gallery-upload-btn'));

      await waitFor(() => {
        expect(mockPickImage).toHaveBeenCalled();
      });

      expect(imageProcessor.processImage).not.toHaveBeenCalled();
      expect(mockUploadPhoto).not.toHaveBeenCalled();
    });

    it('should process and upload selected image', async () => {
      const testFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      mockPickImage.mockResolvedValue(testFile);

      render(<GalleryUploadButton onPhotoUploaded={mockOnPhotoUploaded} />);

      fireEvent.click(screen.getByTestId('gallery-upload-btn'));

      await waitFor(() => {
        expect(imageProcessor.processImage).toHaveBeenCalledWith(testFile, expect.any(Object));
      });

      await waitFor(() => {
        expect(mockUploadPhoto).toHaveBeenCalled();
      });

      await waitFor(() => {
        expect(mockOnPhotoUploaded).toHaveBeenCalledWith('https://example.com/photo.jpg');
      });
    });

    it('should call onError when upload fails', async () => {
      mockPickImage.mockResolvedValue(new File(['test'], 'test.jpg', { type: 'image/jpeg' }));
      mockUploadPhoto.mockRejectedValue(new Error('Upload failed'));

      render(<GalleryUploadButton onPhotoUploaded={mockOnPhotoUploaded} onError={mockOnError} />);

      fireEvent.click(screen.getByTestId('gallery-upload-btn'));

      await waitFor(() => {
        expect(mockOnError).toHaveBeenCalledWith('Upload failed');
      });
    });
  });

  describe('large file handling', () => {
    it('should use larger maxDimension for files over 5MB', async () => {
      // Create a mock file with size > 5MB
      const largeFile = new File(['test'], 'large.jpg', { type: 'image/jpeg' });
      // Mock the size property
      Object.defineProperty(largeFile, 'size', { value: 6 * 1024 * 1024, configurable: true });
      mockPickImage.mockResolvedValue(largeFile);

      render(<GalleryUploadButton onPhotoUploaded={mockOnPhotoUploaded} />);

      fireEvent.click(screen.getByTestId('gallery-upload-btn'));

      await waitFor(() => {
        expect(imageProcessor.processImage).toHaveBeenCalledWith(largeFile, {
          maxDimension: 2000,
        });
      });
    });

    it('should use standard maxDimension for smaller files', async () => {
      const smallFile = new File(['test'], 'small.jpg', { type: 'image/jpeg' });
      mockPickImage.mockResolvedValue(smallFile);

      render(<GalleryUploadButton onPhotoUploaded={mockOnPhotoUploaded} />);

      fireEvent.click(screen.getByTestId('gallery-upload-btn'));

      await waitFor(() => {
        expect(imageProcessor.processImage).toHaveBeenCalledWith(smallFile, {
          maxDimension: 1280,
        });
      });
    });
  });
});
