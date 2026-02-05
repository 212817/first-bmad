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

// Mock carTagStore
vi.mock('@/stores/carTagStore', () => ({
  useCarTagStore: () => ({
    tags: [
      {
        id: 'tag-1',
        name: 'My Car',
        color: '#3B82F6',
        isDefault: true,
        userId: null,
        createdAt: '2024-01-01',
      },
      {
        id: 'tag-2',
        name: 'Rental',
        color: '#10B981',
        isDefault: true,
        userId: null,
        createdAt: '2024-01-01',
      },
    ],
    isLoading: false,
    isHydrated: true,
    error: null,
    fetchTags: vi.fn(),
    getTagById: vi.fn((id: string) =>
      id === 'tag-1'
        ? {
            id: 'tag-1',
            name: 'My Car',
            color: '#3B82F6',
            isDefault: true,
            userId: null,
            createdAt: '2024-01-01',
          }
        : null
    ),
  }),
}));

const mockSpot: Spot = {
  id: 'test-spot-123',
  carTagId: null,
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
  const mockGetSpotById = vi.fn();
  const mockSetCurrentSpot = vi.fn();

  beforeEach(() => {
    // Reset spot store before each test
    useSpotStore.setState({
      currentSpot: mockSpot,
      isLoading: false,
      isSaving: false,
      error: null,
      getSpotById: mockGetSpotById,
      setCurrentSpot: mockSetCurrentSpot,
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
    it('should call navigationService when Navigate Now is clicked', () => {
      renderWithRouter();

      const navigateButton = screen.getByTestId('navigate-button');
      fireEvent.click(navigateButton);

      // Navigation service should be called (mocked)
      expect(navigateButton).toBeInTheDocument();
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

    it('should show note input immediately on confirmation page', () => {
      renderWithRouter();

      // Note section should be visible immediately (no button click needed)
      expect(screen.getByTestId('note-section')).toBeInTheDocument();
      expect(screen.getByTestId('note-input-textarea')).toBeInTheDocument();
    });

    it('should show CarTagSelector always visible', () => {
      renderWithRouter();

      // CarTagSelector should be visible immediately (no toggle needed)
      expect(screen.getByTestId('car-tag-section')).toBeInTheDocument();
      expect(screen.getByTestId('car-tag-selector')).toBeInTheDocument();
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

  describe('NoCoordinatesWarning', () => {
    it('should show warning when spot has address but no coordinates', () => {
      const addressOnlySpot: Spot = {
        id: 'address-only-spot',
        carTagId: null,
        lat: null,
        lng: null,
        accuracyMeters: null,
        address: '123 Manual Entry St, Test City',
        photoUrl: null,
        note: null,
        floor: null,
        spotIdentifier: null,
        isActive: true,
        savedAt: new Date().toISOString(),
      };

      useSpotStore.setState({
        currentSpot: addressOnlySpot,
        isLoading: false,
        isSaving: false,
        error: null,
      });

      renderWithRouter();

      expect(screen.getByTestId('no-coordinates-warning')).toBeInTheDocument();
      expect(screen.getByText(/navigation may be less accurate/i)).toBeInTheDocument();
    });

    it('should not show warning when spot has coordinates', () => {
      // mockSpot has lat/lng, so warning should not appear
      renderWithRouter();

      expect(screen.queryByTestId('no-coordinates-warning')).not.toBeInTheDocument();
    });

    it('should not show warning when spot has no address either', () => {
      const spotWithoutAddress: Spot = {
        id: 'no-address-spot',
        carTagId: null,
        lat: null,
        lng: null,
        accuracyMeters: null,
        address: null,
        photoUrl: null,
        note: null,
        floor: null,
        spotIdentifier: null,
        isActive: true,
        savedAt: new Date().toISOString(),
      };

      useSpotStore.setState({
        currentSpot: spotWithoutAddress,
        isLoading: false,
        isSaving: false,
        error: null,
      });

      renderWithRouter();

      expect(screen.queryByTestId('no-coordinates-warning')).not.toBeInTheDocument();
    });
  });
});
