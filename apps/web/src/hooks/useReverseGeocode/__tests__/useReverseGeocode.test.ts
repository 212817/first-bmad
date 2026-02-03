// apps/web/src/hooks/useReverseGeocode/__tests__/useReverseGeocode.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useReverseGeocode } from '../useReverseGeocode';
import { geocodingApi } from '@/services/api/geocodingApi';

// Mock geocodingApi
vi.mock('@/services/api/geocodingApi', () => ({
    geocodingApi: {
        reverseGeocode: vi.fn(),
    },
}));

describe('useReverseGeocode', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('initial state', () => {
        it('should return existing address if provided', () => {
            const { result } = renderHook(() =>
                useReverseGeocode(40.7128, -74.006, '123 Main St')
            );

            expect(result.current.address).toBe('123 Main St');
            expect(result.current.isLoading).toBe(false);
            expect(result.current.error).toBe(null);
        });

        it('should return null address when no existing address and no coords', () => {
            const { result } = renderHook(() =>
                useReverseGeocode(null, null, null)
            );

            expect(result.current.address).toBe(null);
            expect(result.current.isLoading).toBe(false);
        });
    });

    describe('fetching address', () => {
        it('should fetch address after delay when coords provided and no existing address', async () => {
            const mockAddress = 'Near Main Street';
            vi.mocked(geocodingApi.reverseGeocode).mockResolvedValue({
                address: mockAddress,
                formattedAddress: 'Full Address, City, Country',
            });

            const { result } = renderHook(() =>
                useReverseGeocode(40.7128, -74.006, null, { delay: 10 })
            );

            // Wait for fetch to complete
            await waitFor(() => {
                expect(result.current.address).toBe(mockAddress);
            });

            expect(result.current.isLoading).toBe(false);
            expect(geocodingApi.reverseGeocode).toHaveBeenCalledWith(40.7128, -74.006);
        });

        it('should not fetch when existing address is provided', async () => {
            const { result } = renderHook(() =>
                useReverseGeocode(40.7128, -74.006, 'Existing Address', { delay: 10 })
            );

            // Wait a bit
            await act(async () => {
                await new Promise((r) => setTimeout(r, 50));
            });

            expect(geocodingApi.reverseGeocode).not.toHaveBeenCalled();
            expect(result.current.address).toBe('Existing Address');
        });

        it('should not fetch when skip is true', async () => {
            const { result } = renderHook(() =>
                useReverseGeocode(40.7128, -74.006, null, { skip: true, delay: 10 })
            );

            // Wait a bit
            await act(async () => {
                await new Promise((r) => setTimeout(r, 50));
            });

            expect(geocodingApi.reverseGeocode).not.toHaveBeenCalled();
            expect(result.current.address).toBe(null);
        });

        it('should not fetch when lat is null', async () => {
            renderHook(() => useReverseGeocode(null, -74.006, null, { delay: 10 }));

            await act(async () => {
                await new Promise((r) => setTimeout(r, 50));
            });

            expect(geocodingApi.reverseGeocode).not.toHaveBeenCalled();
        });

        it('should not fetch when lng is null', async () => {
            renderHook(() => useReverseGeocode(40.7128, null, null, { delay: 10 }));

            await act(async () => {
                await new Promise((r) => setTimeout(r, 50));
            });

            expect(geocodingApi.reverseGeocode).not.toHaveBeenCalled();
        });
    });

    describe('error handling', () => {
        it('should set error when fetch fails', async () => {
            vi.mocked(geocodingApi.reverseGeocode).mockRejectedValue(
                new Error('API error')
            );

            const { result } = renderHook(() =>
                useReverseGeocode(40.7128, -74.006, null, { delay: 10 })
            );

            await waitFor(() => {
                expect(result.current.error).toBe('API error');
            });

            expect(result.current.isLoading).toBe(false);
        });

        it('should handle non-Error exceptions', async () => {
            vi.mocked(geocodingApi.reverseGeocode).mockRejectedValue('string error');

            const { result } = renderHook(() =>
                useReverseGeocode(40.7128, -74.006, null, { delay: 10 })
            );

            await waitFor(() => {
                expect(result.current.error).toBe('Failed to fetch address');
            });
        });
    });

    describe('cleanup', () => {
        it('should cancel fetch on unmount', async () => {
            let resolveFn: ((value: { address: string; formattedAddress: string }) => void) | undefined;
            vi.mocked(geocodingApi.reverseGeocode).mockImplementation(
                () =>
                    new Promise((resolve) => {
                        resolveFn = resolve;
                    })
            );

            const { unmount } = renderHook(() =>
                useReverseGeocode(40.7128, -74.006, null, { delay: 10 })
            );

            // Wait for fetch to start
            await act(async () => {
                await new Promise((r) => setTimeout(r, 20));
            });

            unmount();

            // Resolve after unmount - should not throw
            if (resolveFn) {
                resolveFn({ address: 'Address', formattedAddress: 'Full' });
            }
        });

        it('should cancel pending fetch when coords change', async () => {
            vi.mocked(geocodingApi.reverseGeocode).mockResolvedValue({
                address: 'New Address',
                formattedAddress: 'Full New',
            });

            const { rerender, result } = renderHook(
                ({ lat, lng }) => useReverseGeocode(lat, lng, null, { delay: 10 }),
                { initialProps: { lat: 40.7128, lng: -74.006 } }
            );

            // Change coords before first fetch completes
            rerender({ lat: 41.0, lng: -75.0 });

            await waitFor(() => {
                expect(result.current.address).toBe('New Address');
            });

            // Should have been called with new coords
            expect(geocodingApi.reverseGeocode).toHaveBeenCalledWith(41.0, -75.0);
        });
    });

    describe('loading state', () => {
        it('should set loading state during fetch', async () => {
            let resolveFn: ((value: { address: string; formattedAddress: string }) => void) | undefined;
            vi.mocked(geocodingApi.reverseGeocode).mockImplementation(
                () =>
                    new Promise((resolve) => {
                        resolveFn = resolve;
                    })
            );

            const { result } = renderHook(() =>
                useReverseGeocode(40.7128, -74.006, null, { delay: 10 })
            );

            // Wait for fetch to start
            await waitFor(() => {
                expect(result.current.isLoading).toBe(true);
            });

            // Resolve the promise
            await act(async () => {
                resolveFn?.({ address: 'Address', formattedAddress: 'Full' });
            });

            await waitFor(() => {
                expect(result.current.isLoading).toBe(false);
            });
        });
    });
});
