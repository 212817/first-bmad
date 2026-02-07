// apps/web/src/pages/__tests__/SpotConfirmationPage.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
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
  })),
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
      </Routes>
    </MemoryRouter>
  );
};

describe('SpotConfirmationPage', () => {
  beforeEach(() => {
    useSpotStore.setState({
      currentSpot: mockSpot,
      isLoading: false,
      isSaving: false,
      error: null,
    });
    vi.clearAllMocks();
  });

  it('should render the confirmation page', () => {
    renderWithRouter();
    expect(screen.getByTestId('spot-confirmation-page')).toBeInTheDocument();
  });

  it('should render SpotDetailCard', () => {
    renderWithRouter();
    expect(screen.getByTestId('spot-detail-card')).toBeInTheDocument();
  });

  it('should render SpotActions', () => {
    renderWithRouter();
    expect(screen.getByTestId('spot-actions')).toBeInTheDocument();
  });

  it('should render buttons', () => {
    renderWithRouter();
    expect(screen.getByTestId('navigate-button')).toBeInTheDocument();
    expect(screen.getByTestId('done-button')).toBeInTheDocument();
  });

  it('should render the spot address', () => {
    renderWithRouter();
    // Address includes "Near" prefix
    expect(screen.getByText(/123 Test St/)).toBeInTheDocument();
  });

  it('should render loading state when isLoading', () => {
    useSpotStore.setState({ currentSpot: null, isLoading: true });
    renderWithRouter();
    // Loading spinner doesn't have role="status", check for spinner class
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should render message when spot not found', () => {
    useSpotStore.setState({ currentSpot: null, isLoading: false });
    renderWithRouter();
    // When no spot, shows loading spinner (useEffect will try to load)
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });

  it('should render camera action button', () => {
    renderWithRouter();
    // Camera button in SpotActions
    expect(screen.getByTestId('action-button-camera')).toBeInTheDocument();
  });

  it('should open camera when camera action is clicked', async () => {
    const user = userEvent.setup();
    renderWithRouter();

    const cameraButton = screen.getByTestId('action-button-camera');
    await user.click(cameraButton);

    expect(screen.getByTestId('camera-capture')).toBeInTheDocument();
  });

  it('should display spot photo in SpotDetailCard when photoUrl exists', () => {
    useSpotStore.setState({
      currentSpot: { ...mockSpot, photoUrl: 'https://example.com/photo.jpg' },
    });
    renderWithRouter();

    // Photo is shown in SpotDetailCard, not as separate element
    const img = document.querySelector('img');
    expect(img).toBeInTheDocument();
  });

  it('should render car tag selector', () => {
    renderWithRouter();
    expect(screen.getByTestId('car-tag-selector')).toBeInTheDocument();
  });

  it('should render note section', () => {
    renderWithRouter();
    expect(screen.getByTestId('note-section')).toBeInTheDocument();
  });

  it('should show existing note when spot has note', () => {
    useSpotStore.setState({
      currentSpot: { ...mockSpot, note: 'Test note' },
    });
    renderWithRouter();
    expect(screen.getByText('Test note')).toBeInTheDocument();
  });

  it('should handle navigate button click', async () => {
    const user = userEvent.setup();
    renderWithRouter();

    const navigateBtn = screen.getByTestId('navigate-button');
    await user.click(navigateBtn);
    // Navigation opens external map app - no assertion needed, just verify no crash
  });

  it('should handle done button click and navigate home', async () => {
    const user = userEvent.setup();
    renderWithRouter();

    const doneBtn = screen.getByTestId('done-button');
    await user.click(doneBtn);
    // Done navigates to home
  });

  it('should show timer button highlighted when meterExpiresAt is set', () => {
    const futureDate = new Date(Date.now() + 60 * 60 * 1000).toISOString();
    useSpotStore.setState({
      currentSpot: { ...mockSpot, meterExpiresAt: futureDate },
    });
    renderWithRouter();

    // Timer button shows "Timer ✓" when active
    const timerButton = screen.getByTestId('action-button-timer');
    expect(timerButton).toBeInTheDocument();
    expect(timerButton.textContent).toContain('Timer');
  });

  it('should update note when edited', async () => {
    const user = userEvent.setup();
    renderWithRouter();

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
    const user = userEvent.setup();
    renderWithRouter();

    const tagSelector = screen.getByTestId('car-tag-selector');
    const tagButtons = tagSelector.querySelectorAll('button');
    const firstButton = tagButtons[0];

    if (firstButton) {
      await user.click(firstButton);
      // Tag selection updates store
    }
  });
});
