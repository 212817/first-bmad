// apps/web/src/components/history/__tests__/HistorySpotItem.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { HistorySpotItem } from '../HistorySpotItem';
import { useCarTagStore } from '@/stores/carTagStore';
import type { Spot } from '@/stores/spot.types';

vi.mock('@/stores/carTagStore');

describe('HistorySpotItem', () => {
  const mockSpot: Spot = {
    id: 'spot-1',
    carTagId: null,
    lat: 40.7128,
    lng: -74.006,
    accuracyMeters: 15,
    address: '123 Main St, New York',
    photoUrl: null,
    note: null,
    floor: null,
    spotIdentifier: null,
    isActive: false,
    savedAt: new Date().toISOString(),
  };

  const mockCarTag = {
    id: 'tag-1',
    name: 'My Car',
    color: '#3B82F6',
    isDefault: true,
    userId: 'user-1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useCarTagStore).mockReturnValue({
      tags: [],
      isLoading: false,
      error: null,
      fetchTags: vi.fn(),
      createTag: vi.fn(),
      updateTag: vi.fn(),
      deleteTag: vi.fn(),
      getTagById: vi.fn().mockReturnValue(null),
    });
  });

  it('should render with address', () => {
    render(<HistorySpotItem spot={mockSpot} />);

    expect(screen.getByTestId('history-spot-location')).toHaveTextContent('123 Main St, New York');
  });

  it('should render with coordinates when no address', () => {
    const spotWithoutAddress: Spot = {
      ...mockSpot,
      address: null,
    };

    render(<HistorySpotItem spot={spotWithoutAddress} />);

    expect(screen.getByTestId('history-spot-location')).toHaveTextContent('40.7128°, -74.0060°');
  });

  it('should show "Unknown location" when no address and no coordinates', () => {
    const spotWithoutLocation: Spot = {
      ...mockSpot,
      address: null,
      lat: null,
      lng: null,
    };

    render(<HistorySpotItem spot={spotWithoutLocation} />);

    expect(screen.getByTestId('history-spot-location')).toHaveTextContent('Unknown location');
  });

  it('should display relative time', () => {
    render(<HistorySpotItem spot={mockSpot} />);

    expect(screen.getByTestId('history-spot-time')).toBeInTheDocument();
  });

  it('should show car tag badge when carTagId exists', () => {
    vi.mocked(useCarTagStore).mockReturnValue({
      tags: [mockCarTag],
      isLoading: false,
      error: null,
      fetchTags: vi.fn(),
      createTag: vi.fn(),
      updateTag: vi.fn(),
      deleteTag: vi.fn(),
      getTagById: vi.fn().mockReturnValue(mockCarTag),
    });

    const spotWithTag: Spot = {
      ...mockSpot,
      carTagId: 'tag-1',
    };

    render(<HistorySpotItem spot={spotWithTag} />);

    expect(screen.getByTestId('tag-badge')).toHaveTextContent('My Car');
  });

  it('should show active indicator when spot is active', () => {
    const activeSpot: Spot = {
      ...mockSpot,
      isActive: true,
    };

    render(<HistorySpotItem spot={activeSpot} />);

    expect(screen.getByTitle('Active spot')).toBeInTheDocument();
  });

  it('should not show active indicator when spot is not active', () => {
    render(<HistorySpotItem spot={mockSpot} />);

    expect(screen.queryByTitle('Active spot')).not.toBeInTheDocument();
  });

  it('should call onClick when clicked', () => {
    const onClick = vi.fn();

    render(<HistorySpotItem spot={mockSpot} onClick={onClick} />);

    fireEvent.click(screen.getByTestId('history-spot-item'));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('should show note preview when note exists', () => {
    const spotWithNote: Spot = {
      ...mockSpot,
      note: 'Near the coffee shop',
    };

    render(<HistorySpotItem spot={spotWithNote} />);

    expect(screen.getByTestId('history-spot-note')).toHaveTextContent('Near the coffee shop');
  });

  it('should not show note preview when no note', () => {
    render(<HistorySpotItem spot={mockSpot} />);

    expect(screen.queryByTestId('history-spot-note')).not.toBeInTheDocument();
  });

  it('should show photo thumbnail when photoUrl exists', () => {
    const spotWithPhoto: Spot = {
      ...mockSpot,
      photoUrl: 'https://example.com/photo.jpg',
    };

    render(<HistorySpotItem spot={spotWithPhoto} />);

    expect(screen.getByRole('img', { name: 'Parking spot' })).toBeInTheDocument();
  });

  it('should show placeholder when no photoUrl', () => {
    render(<HistorySpotItem spot={mockSpot} />);

    // Check for location icon placeholder
    expect(screen.getByText('📍')).toBeInTheDocument();
  });
});
