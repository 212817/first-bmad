// apps/web/src/pages/__tests__/SpotConfirmationPage.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { SpotConfirmationPage } from '../SpotConfirmationPage';
import { useSpotStore } from '@/stores/spotStore';
import type { Spot } from '@/stores/spot.types';

// Mock CameraCapture component
vi.mock('@/components/camera/CameraCapture', () => ({
  CameraCapture: ({
    onCapture,
    onClose,
  }: {
    onCapture: (blob: Blob) => void;
    onClose: () => void;
  }) => (
    <div data-testid="camera-capture">
      <button data-testid="capture-button" onClick={() => onCapture(new Blob(['test']))}>
        Capture
      </button>
      <button data-testid="close-camera-button" onClick={onClose}>
        Close
      </button>
    </div>
  ),
}));

// Mock usePhotoUpload hook
const mockUploadPhoto = vi.fn();
const mockResetUpload = vi.fn();
vi.mock('@/hooks/usePhotoUpload/usePhotoUpload', () => ({
  usePhotoUpload: () => ({
    uploadPhoto: mockUploadPhoto,
    status: 'idle',
    progress: 0,
    reset: mockResetUpload,
    error: null,
    result: null,
  }),
}));

const mockSpot: Spot = {
  id: 'test-spot-123',
  lat: 40.7128,
  lng: -74.006,
  accuracyMeters: 10,
  address: '123 Test St',
  photoUrl: null,
  note: null,
  floor: null,
  spotIdentifier: null,
  isActive: true,
  savedAt: new Date().toISOString(),
};

const renderWithRouter = (initialRoute = '/spot/test-spot-123/confirm') => {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <Routes>
        <Route path="/" element={<div data-testid="home-page">Home</div>} />
        <Route path="/spot/:spotId/confirm" element={<SpotConfirmationPage />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('SpotConfirmationPage', () => {
  beforeEach(() => {
    // Reset spot store before each test
    useSpotStore.setState({
      currentSpot: mockSpot,
      isLoading: false,
      isSaving: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render the confirmation page with spot data', () => {
      renderWithRouter();

      expect(screen.getByTestId('spot-confirmation-page')).toBeInTheDocument();
      expect(screen.getByText('Spot Saved!')).toBeInTheDocument();
    });

    it('should render the SpotDetailCard component', () => {
      renderWithRouter();

      expect(screen.getByTestId('spot-detail-card')).toBeInTheDocument();
    });

    it('should render the SpotActions component', () => {
      renderWithRouter();

      expect(screen.getByTestId('spot-actions')).toBeInTheDocument();
    });

    it('should render Navigate Now button', () => {
      renderWithRouter();

      expect(screen.getByTestId('navigate-button')).toBeInTheDocument();
      expect(screen.getByText('Navigate Now')).toBeInTheDocument();
    });

    it('should render Done button', () => {
      renderWithRouter();

      expect(screen.getByTestId('done-button')).toBeInTheDocument();
      expect(screen.getByText('Done')).toBeInTheDocument();
    });

    it('should show success checkmark animation initially', () => {
      renderWithRouter();

      // The checkmark should be visible
      expect(screen.getByText('✓')).toBeInTheDocument();
    });
  });

  describe('navigation', () => {
    it('should navigate to home when Done button is clicked', async () => {
      renderWithRouter();

      const doneButton = screen.getByTestId('done-button');
      fireEvent.click(doneButton);

      await waitFor(() => {
        expect(screen.getByTestId('home-page')).toBeInTheDocument();
      });
    });

    it('should show loading state when no spot data is available', () => {
      useSpotStore.setState({
        currentSpot: null,
        isLoading: false,
        isSaving: false,
        error: null,
      });

      // Render without the home route to observe loading state
      render(
        <MemoryRouter initialEntries={['/spot/test-spot-123/confirm']}>
          <Routes>
            <Route path="/spot/:spotId/confirm" element={<SpotConfirmationPage />} />
          </Routes>
        </MemoryRouter>
      );

      // Should show loading spinner when no spot available
      expect(document.querySelector('.animate-spin')).toBeTruthy();
    });
  });

  describe('Navigate Now button', () => {
    it('should log message when Navigate Now is clicked (placeholder)', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      renderWithRouter();

      const navigateButton = screen.getByTestId('navigate-button');
      fireEvent.click(navigateButton);

      expect(consoleSpy).toHaveBeenCalledWith('Navigate - Coming in Epic 3');
      consoleSpy.mockRestore();
    });
  });

  describe('action button handlers', () => {
    it('should open camera when Camera action is clicked', () => {
      renderWithRouter();

      // Camera should not be visible initially
      expect(screen.queryByTestId('camera-capture')).not.toBeInTheDocument();

      // Click camera button
      const cameraButton = screen.getByTestId('action-button-camera');
      fireEvent.click(cameraButton);

      // Camera should now be visible
      expect(screen.getByTestId('camera-capture')).toBeInTheDocument();
    });

    it('should close camera when close button is clicked', () => {
      renderWithRouter();

      // Open camera
      const cameraButton = screen.getByTestId('action-button-camera');
      fireEvent.click(cameraButton);
      expect(screen.getByTestId('camera-capture')).toBeInTheDocument();

      // Close camera
      const closeButton = screen.getByTestId('close-camera-button');
      fireEvent.click(closeButton);

      // Camera should be hidden
      expect(screen.queryByTestId('camera-capture')).not.toBeInTheDocument();
    });

    it('should log message when Note action is clicked', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      renderWithRouter();

      const noteButton = screen.getByTestId('action-button-note');
      fireEvent.click(noteButton);

      expect(consoleSpy).toHaveBeenCalledWith('Add Note - Coming in Story 2.5');
      consoleSpy.mockRestore();
    });

    it('should log message when Tag action is clicked', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      renderWithRouter();

      const tagButton = screen.getByTestId('action-button-tag');
      fireEvent.click(tagButton);

      expect(consoleSpy).toHaveBeenCalledWith('Set Tag - Coming in Story 2.7');
      consoleSpy.mockRestore();
    });

    it('should log message when Timer action is clicked (disabled)', () => {
      const consoleSpy = vi.spyOn(console, 'log');
      renderWithRouter();

      const timerButton = screen.getByTestId('action-button-timer');
      fireEvent.click(timerButton);

      // Timer is disabled, so handler should NOT be called
      expect(consoleSpy).not.toHaveBeenCalledWith('Set Timer - Coming in Epic 4');
      consoleSpy.mockRestore();
    });
  });

  describe('redirect behavior', () => {
    it('should show loading state when no currentSpot but has spotId', () => {
      useSpotStore.setState({
        currentSpot: null,
        isLoading: false,
        isSaving: false,
        error: null,
      });

      render(
        <MemoryRouter initialEntries={['/spot/test-spot-123/confirm']}>
          <Routes>
            <Route path="/" element={<div data-testid="home-page">Home</div>} />
            <Route path="/spot/:spotId/confirm" element={<SpotConfirmationPage />} />
          </Routes>
        </MemoryRouter>
      );

      // Shows loading spinner when no currentSpot (spotId is present so no redirect)
      expect(document.querySelector('.animate-spin')).toBeTruthy();
    });
  });
});
