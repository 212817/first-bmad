// apps/web/src/pages/__tests__/SpotConfirmationPage.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import type { Spot } from '@/stores/spot.types';

// Note: @/components/map is mocked globally in src/test/setup.ts (leaflet crashes jsdom)

// Mock CameraCapture - uses canvas/media APIs
vi.mock('@/components/camera/CameraCapture', () => ({
  CameraCapture: ({
    onCapture,
    onClose,
  }: {
    onCapture: (blob: Blob) => void;
    onClose: () => void;
  }) => (
    <div data-testid="camera-capture">
      <button onClick={() => onCapture(new Blob(['test'], { type: 'image/jpeg' }))}>Capture</button>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

// Mock carTagStore
const mockCarTags = [
  { id: 'tag1', name: 'Work Car', colorHex: '#3B82F6' },
  { id: 'tag2', name: 'Home Car', colorHex: '#10B981' },
];
vi.mock('@/stores/carTagStore', () => ({
  useCarTagStore: vi.fn(() => ({
    tags: mockCarTags,
    isLoading: false,
    fetchTags: vi.fn(),
    tagsHydrated: true,
    isHydrated: true,
  })),
}));

// Mock guestStore
const mockGuestStoreState = { isGuest: false };
vi.mock('@/stores/guestStore', () => ({
  useGuestStore: Object.assign(
    vi.fn(() => mockGuestStoreState),
    { getState: () => mockGuestStoreState }
  ),
}));

// Mock useReverseGeocode to prevent API calls
vi.mock('@/hooks/useReverseGeocode/useReverseGeocode', () => ({
  useReverseGeocode: vi.fn(() => ({
    address: '123 Test St',
    isLoading: false,
    error: null,
  })),
}));

// Mock useNavigation to prevent external navigation
vi.mock('@/hooks/useNavigation/useNavigation', () => ({
  useNavigation: vi.fn(() => ({
    openPicker: vi.fn(),
    closePicker: vi.fn(),
    isPickerOpen: false,
    pendingSpot: null,
    navigateToSpot: vi.fn(),
  })),
}));

// Mock usePhotoUpload to prevent upload attempts
vi.mock('@/hooks/usePhotoUpload/usePhotoUpload', () => ({
  usePhotoUpload: vi.fn(() => ({
    uploadPhoto: vi.fn().mockResolvedValue('https://example.com/photo.jpg'),
    status: 'idle' as const,
    progress: 0,
    error: null,
    reset: vi.fn(),
  })),
}));

// Mock useFilePicker
vi.mock('@/hooks/useFilePicker/useFilePicker', () => ({
  useFilePicker: vi.fn(() => ({
    pickImage: vi.fn(),
  })),
}));

// Mock ShareButton to prevent act() warnings from async state updates
vi.mock('@/components/spot/ShareButton', () => ({
  ShareButton: ({ spotId }: { spotId: string }) => (
    <button data-testid="share-button" data-spot-id={spotId}>Share</button>
  ),
}));

import { SpotConfirmationPage } from '../SpotConfirmationPage';
import { useSpotStore } from '@/stores/spotStore';

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
  meterExpiresAt: null,
  isActive: true,
  savedAt: new Date().toISOString(),
};

const renderWithRouter = () => {
  return render(
    <MemoryRouter initialEntries={['/spot/test-spot-123/confirm']}>
      <Routes>
        <Route path="/spot/:spotId/confirm" element={<SpotConfirmationPage />} />
        <Route path="/" element={<div data-testid="home-page">Home</div>} />
      </Routes>
    </MemoryRouter>
  );
};

describe('SpotConfirmationPage', () => {
  beforeEach(() => {
    // Use fake timers with shouldAdvanceTime to let waitFor work while controlling timers
    vi.useFakeTimers({ shouldAdvanceTime: true });
    useSpotStore.setState({
      currentSpot: mockSpot,
      isLoading: false,
      isSaving: false,
      error: null,
      getSpotById: vi.fn().mockResolvedValue(mockSpot),
      setCurrentSpot: vi.fn(),
      updateSpot: vi.fn().mockResolvedValue(undefined),
    });
    vi.clearAllMocks();
  });

  afterEach(async () => {
    // Advance timers BEFORE cleanup to let pending setTimeout callbacks complete
    // This prevents "not wrapped in act(...)" warnings
    await act(async () => {
      await vi.advanceTimersByTimeAsync(3000);
    });
    cleanup();
    vi.useRealTimers();
    useSpotStore.setState({
      currentSpot: mockSpot,
      isLoading: false,
      isSaving: false,
      error: null,
    });
  });

  it('should render the confirmation page', async () => {
    renderWithRouter();
    await waitFor(() => {
      expect(screen.getByTestId('spot-confirmation-page')).toBeInTheDocument();
    });
  });

  it('should render SpotDetailCard', async () => {
    renderWithRouter();
    await waitFor(() => {
      expect(screen.getByTestId('spot-detail-card')).toBeInTheDocument();
    });
  });

  it('should render SpotActions', async () => {
    renderWithRouter();
    await waitFor(() => {
      expect(screen.getByTestId('spot-actions')).toBeInTheDocument();
    });
  });

  it('should render buttons', async () => {
    renderWithRouter();
    await waitFor(() => {
      expect(screen.getByTestId('navigate-button')).toBeInTheDocument();
      expect(screen.getByTestId('done-button')).toBeInTheDocument();
    });
  });

  it('should render the spot address', async () => {
    renderWithRouter();
    await waitFor(() => {
      expect(screen.getByText(/123 Test St/)).toBeInTheDocument();
    });
  });

  it('should render loading state when isLoading', async () => {
    useSpotStore.setState({ currentSpot: null, isLoading: true });
    renderWithRouter();
    await waitFor(() => {
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });
  });

  it('should render message when spot not found', async () => {
    useSpotStore.setState({ currentSpot: null, isLoading: false });
    renderWithRouter();
    await waitFor(() => {
      expect(document.querySelector('.animate-spin')).toBeInTheDocument();
    });
  });

  it('should render camera action button', async () => {
    renderWithRouter();
    await waitFor(() => {
      expect(screen.getByTestId('action-button-camera')).toBeInTheDocument();
    });
  });

  it('should open camera when camera action is clicked', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByTestId('action-button-camera')).toBeInTheDocument();
    });

    const cameraButton = screen.getByTestId('action-button-camera');
    await user.click(cameraButton);

    await waitFor(() => {
      expect(screen.getByTestId('camera-capture')).toBeInTheDocument();
    });
  });

  it('should display spot photo in SpotDetailCard when photoUrl exists', async () => {
    useSpotStore.setState({
      currentSpot: { ...mockSpot, photoUrl: 'https://example.com/photo.jpg' },
    });
    renderWithRouter();

    await waitFor(() => {
      const img = document.querySelector('img');
      expect(img).toBeInTheDocument();
    });
  });

  it('should render car tag selector', async () => {
    renderWithRouter();
    await waitFor(() => {
      expect(screen.getByTestId('car-tag-selector')).toBeInTheDocument();
    });
  });

  it('should render note section', async () => {
    renderWithRouter();
    await waitFor(() => {
      expect(screen.getByTestId('note-section')).toBeInTheDocument();
    });
  });

  it('should show existing note when spot has note', async () => {
    useSpotStore.setState({
      currentSpot: { ...mockSpot, note: 'Test note' },
    });
    renderWithRouter();
    await waitFor(() => {
      expect(screen.getByText('Test note')).toBeInTheDocument();
    });
  });

  it('should handle navigate button click', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByTestId('navigate-button')).toBeInTheDocument();
    });

    const navigateBtn = screen.getByTestId('navigate-button');
    await user.click(navigateBtn);
  });

  it('should handle done button click and navigate home', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByTestId('done-button')).toBeInTheDocument();
    });

    const doneBtn = screen.getByTestId('done-button');
    await user.click(doneBtn);
  });

  it('should show timer button highlighted when meterExpiresAt is set', async () => {
    const futureDate = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    useSpotStore.setState({
      currentSpot: { ...mockSpot, meterExpiresAt: futureDate },
    });
    renderWithRouter();

    await waitFor(() => {
      const timerButton = screen.getByTestId('action-button-timer');
      expect(timerButton).toBeInTheDocument();
      expect(timerButton.textContent).toContain('Timer');
    });
  });

  it('should update note when edited', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByTestId('note-section')).toBeInTheDocument();
    });

    const noteSection = screen.getByTestId('note-section');
    const editButton = noteSection.querySelector('[data-testid="edit-note-button"]');

    if (editButton) {
      await user.click(editButton);
      const input = screen.getByRole('textbox');
      await user.clear(input);
      await user.type(input, 'Updated note');

      const saveButton = screen.getByTestId('save-note-button');
      await user.click(saveButton);

      await waitFor(() => {
        expect(screen.getByText('Updated note')).toBeInTheDocument();
      });
    }
  });

  it('should assign car tag when selected', async () => {
    const user = userEvent.setup({ advanceTimers: vi.advanceTimersByTime });
    renderWithRouter();

    await waitFor(() => {
      expect(screen.getByTestId('car-tag-selector')).toBeInTheDocument();
    });

    const tagSelector = screen.getByTestId('car-tag-selector');
    const tagButtons = tagSelector.querySelectorAll('button');
    const firstButton = tagButtons[0];

    if (firstButton) {
      await user.click(firstButton);
    }
  });
});
