// apps/web/src/components/map/__tests__/LayerSwitcher.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';

import { LayerSwitcher } from '../LayerSwitcher';
import type { MapViewType } from '../types';

describe('LayerSwitcher', () => {
  const mockOnLayerChange = vi.fn();

  beforeEach(() => {
    mockOnLayerChange.mockClear();
  });

  describe('rendering', () => {
    it('renders layer switcher button', () => {
      render(<LayerSwitcher activeLayer="street" onLayerChange={mockOnLayerChange} />);

      expect(screen.getByTestId('layer-switcher')).toBeInTheDocument();
      expect(screen.getByTestId('layer-switcher-button')).toBeInTheDocument();
    });

    it('shows current layer name on button', () => {
      render(<LayerSwitcher activeLayer="satellite" onLayerChange={mockOnLayerChange} />);

      expect(screen.getByText('Satellite')).toBeInTheDocument();
    });

    it('does not show menu by default', () => {
      render(<LayerSwitcher activeLayer="street" onLayerChange={mockOnLayerChange} />);

      expect(screen.queryByTestId('layer-switcher-menu')).not.toBeInTheDocument();
    });
  });

  describe('menu interaction', () => {
    it('opens menu on button click', () => {
      render(<LayerSwitcher activeLayer="street" onLayerChange={mockOnLayerChange} />);

      fireEvent.click(screen.getByTestId('layer-switcher-button'));

      expect(screen.getByTestId('layer-switcher-menu')).toBeInTheDocument();
    });

    it('closes menu on second button click', () => {
      render(<LayerSwitcher activeLayer="street" onLayerChange={mockOnLayerChange} />);

      const button = screen.getByTestId('layer-switcher-button');
      fireEvent.click(button);
      fireEvent.click(button);

      expect(screen.queryByTestId('layer-switcher-menu')).not.toBeInTheDocument();
    });

    it('shows all layer options', () => {
      render(<LayerSwitcher activeLayer="street" onLayerChange={mockOnLayerChange} />);

      fireEvent.click(screen.getByTestId('layer-switcher-button'));

      expect(screen.getByTestId('layer-option-street')).toBeInTheDocument();
      expect(screen.getByTestId('layer-option-satellite')).toBeInTheDocument();
      expect(screen.getByTestId('layer-option-hybrid')).toBeInTheDocument();
    });

    it('highlights active layer option', () => {
      render(<LayerSwitcher activeLayer="satellite" onLayerChange={mockOnLayerChange} />);

      fireEvent.click(screen.getByTestId('layer-switcher-button'));

      const satelliteOption = screen.getByTestId('layer-option-satellite');
      expect(satelliteOption).toHaveClass('bg-indigo-50');
    });
  });

  describe('layer selection', () => {
    it('calls onLayerChange when layer is selected', () => {
      render(<LayerSwitcher activeLayer="street" onLayerChange={mockOnLayerChange} />);

      fireEvent.click(screen.getByTestId('layer-switcher-button'));
      fireEvent.click(screen.getByTestId('layer-option-satellite'));

      expect(mockOnLayerChange).toHaveBeenCalledWith('satellite');
    });

    it('closes menu after selection', () => {
      render(<LayerSwitcher activeLayer="street" onLayerChange={mockOnLayerChange} />);

      fireEvent.click(screen.getByTestId('layer-switcher-button'));
      fireEvent.click(screen.getByTestId('layer-option-hybrid'));

      expect(screen.queryByTestId('layer-switcher-menu')).not.toBeInTheDocument();
    });

    it.each([
      ['street', 'street'],
      ['satellite', 'satellite'],
      ['hybrid', 'hybrid'],
    ] as [MapViewType, string][])('selects %s layer correctly', (layer, expectedCall) => {
      render(<LayerSwitcher activeLayer="street" onLayerChange={mockOnLayerChange} />);

      fireEvent.click(screen.getByTestId('layer-switcher-button'));
      fireEvent.click(screen.getByTestId(`layer-option-${layer}`));

      expect(mockOnLayerChange).toHaveBeenCalledWith(expectedCall);
    });
  });

  describe('accessibility', () => {
    it('has accessible button label', () => {
      render(<LayerSwitcher activeLayer="street" onLayerChange={mockOnLayerChange} />);

      const button = screen.getByTestId('layer-switcher-button');
      expect(button).toHaveAttribute('aria-label', 'Map view: Street. Click to change.');
    });
  });
});
