// apps/web/src/components/map/LayerSwitcher.tsx
import { useState } from 'react';

import type { LayerSwitcherProps, MapViewType } from './types';

const LAYER_OPTIONS: { value: MapViewType; label: string; icon: string }[] = [
  { value: 'street', label: 'Street', icon: '🗺️' },
  { value: 'satellite', label: 'Satellite', icon: '🛰️' },
  { value: 'hybrid', label: 'Hybrid', icon: '🏙️' },
];

/**
 * Layer switcher component for toggling between map views
 */
export const LayerSwitcher = ({ activeLayer, onLayerChange }: LayerSwitcherProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const activeOption = LAYER_OPTIONS.find((o) => o.value === activeLayer) ?? LAYER_OPTIONS[0];

  const handleSelect = (layer: MapViewType) => {
    onLayerChange(layer);
    setIsOpen(false);
  };

  return (
    <div className="absolute top-2 right-2 z-[1000]" data-testid="layer-switcher">
      {/* Toggle button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 px-2 py-1.5 bg-white rounded-lg shadow-md text-sm font-medium hover:bg-gray-50"
        aria-label={`Map view: ${activeOption?.label}. Click to change.`}
        data-testid="layer-switcher-button"
      >
        <span aria-hidden="true">{activeOption?.icon}</span>
        <span className="hidden sm:inline">{activeOption?.label}</span>
      </button>

      {/* Dropdown menu */}
      {isOpen && (
        <div
          className="absolute top-full right-0 mt-1 bg-white rounded-lg shadow-lg overflow-hidden min-w-[120px]"
          data-testid="layer-switcher-menu"
        >
          {LAYER_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => handleSelect(option.value)}
              className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-100 ${
                activeLayer === option.value ? 'bg-indigo-50 text-indigo-700' : 'text-gray-700'
              }`}
              data-testid={`layer-option-${option.value}`}
            >
              <span aria-hidden="true">{option.icon}</span>
              <span>{option.label}</span>
              {activeLayer === option.value && (
                <span className="ml-auto text-indigo-600">✓</span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
