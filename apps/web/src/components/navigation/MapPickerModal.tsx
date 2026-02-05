// apps/web/src/components/navigation/MapPickerModal.tsx
import { useCallback } from 'react';
import type { MapProvider } from '@/services/navigation/types';

interface MapPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (provider: MapProvider) => void;
}

/**
 * Modal to let user pick their preferred map app for navigation
 * Always shows both Google Maps and Apple Maps options
 */
export const MapPickerModal = ({ isOpen, onClose, onSelect }: MapPickerModalProps) => {
  const handleSelect = useCallback(
    (provider: MapProvider) => {
      onSelect(provider);
      onClose();
    },
    [onSelect, onClose]
  );

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-label="Choose navigation app"
      data-testid="map-picker-modal"
    >
      <div className="w-full max-w-lg bg-white rounded-t-2xl p-4 pb-8 animate-slide-up">
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-4" />

        <h2 className="text-lg font-semibold text-center text-gray-900 mb-4">Open with</h2>

        <div className="space-y-3">
          {/* Google Maps */}
          <button
            onClick={() => handleSelect('google')}
            className="w-full flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
            data-testid="map-picker-google"
          >
            <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none">
                <path
                  d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"
                  fill="#EA4335"
                />
                <circle cx="12" cy="9" r="2.5" fill="white" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-900">Google Maps</p>
              <p className="text-sm text-gray-500">Walking directions</p>
            </div>
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Apple Maps */}
          <button
            onClick={() => handleSelect('apple')}
            className="w-full flex items-center gap-4 p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors"
            data-testid="map-picker-apple"
          >
            <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-8 h-8" fill="none">
                <rect x="3" y="3" width="18" height="18" rx="4" fill="#34C759" />
                <path
                  d="M12 6C9.24 6 7 8.24 7 11c0 4.5 5 9 5 9s5-4.5 5-9c0-2.76-2.24-5-5-5z"
                  fill="white"
                />
                <circle cx="12" cy="11" r="2" fill="#34C759" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <p className="font-medium text-gray-900">Apple Maps</p>
              <p className="text-sm text-gray-500">Walking directions</p>
            </div>
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 py-3 text-gray-500 font-medium"
          data-testid="map-picker-cancel"
        >
          Cancel
        </button>
      </div>
    </div>
  );
};
