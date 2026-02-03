// apps/web/src/components/spot/__tests__/AddressInput.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { AddressInput } from '../AddressInput';

describe('AddressInput', () => {
  const defaultProps = {
    onSubmit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render the address input form', () => {
      render(<AddressInput {...defaultProps} />);

      expect(screen.getByTestId('address-input')).toBeInTheDocument();
      expect(screen.getByTestId('address-input-field')).toBeInTheDocument();
      expect(screen.getByTestId('address-input-submit')).toBeInTheDocument();
    });

    it('should show label text', () => {
      render(<AddressInput {...defaultProps} />);

      expect(screen.getByText('Enter parking address')).toBeInTheDocument();
    });

    it('should show placeholder', () => {
      render(<AddressInput {...defaultProps} />);

      const input = screen.getByTestId('address-input-field');
      expect(input).toHaveAttribute('placeholder', '123 Main St, City, State');
    });

    it('should show "Save Spot" button text by default', () => {
      render(<AddressInput {...defaultProps} />);

      expect(screen.getByTestId('address-input-submit')).toHaveTextContent('Save Spot');
    });

    it('should show "Finding location..." when loading', () => {
      render(<AddressInput {...defaultProps} isLoading />);

      expect(screen.getByTestId('address-input-submit')).toHaveTextContent('Finding location...');
    });
  });

  describe('input handling', () => {
    it('should update input value on change', () => {
      render(<AddressInput {...defaultProps} />);

      const input = screen.getByTestId('address-input-field');
      fireEvent.change(input, { target: { value: '123 Main St' } });

      expect(input).toHaveValue('123 Main St');
    });

    it('should show clear button when input has value', () => {
      render(<AddressInput {...defaultProps} />);

      const input = screen.getByTestId('address-input-field');
      expect(screen.queryByTestId('address-input-clear')).not.toBeInTheDocument();

      fireEvent.change(input, { target: { value: 'Test' } });

      expect(screen.getByTestId('address-input-clear')).toBeInTheDocument();
    });

    it('should clear input when clear button is clicked', () => {
      render(<AddressInput {...defaultProps} />);

      const input = screen.getByTestId('address-input-field');
      fireEvent.change(input, { target: { value: '123 Main St' } });
      expect(input).toHaveValue('123 Main St');

      fireEvent.click(screen.getByTestId('address-input-clear'));

      expect(input).toHaveValue('');
    });

    it('should not show clear button when loading', () => {
      render(<AddressInput {...defaultProps} isLoading />);

      const input = screen.getByTestId('address-input-field');
      fireEvent.change(input, { target: { value: 'Test' } });

      expect(screen.queryByTestId('address-input-clear')).not.toBeInTheDocument();
    });
  });

  describe('form submission', () => {
    it('should call onSubmit with trimmed address on form submit', () => {
      const onSubmit = vi.fn();
      render(<AddressInput onSubmit={onSubmit} />);

      const input = screen.getByTestId('address-input-field');
      fireEvent.change(input, { target: { value: '  123 Main St, City, State  ' } });
      fireEvent.submit(screen.getByTestId('address-input'));

      expect(onSubmit).toHaveBeenCalledWith('123 Main St, City, State');
    });

    it('should NOT submit when address is too short (less than 5 chars)', () => {
      const onSubmit = vi.fn();
      render(<AddressInput onSubmit={onSubmit} />);

      const input = screen.getByTestId('address-input-field');
      fireEvent.change(input, { target: { value: 'Test' } }); // 4 chars
      fireEvent.submit(screen.getByTestId('address-input'));

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('should NOT submit when loading', () => {
      const onSubmit = vi.fn();
      render(<AddressInput onSubmit={onSubmit} isLoading />);

      const input = screen.getByTestId('address-input-field');
      fireEvent.change(input, { target: { value: '123 Main St' } });
      fireEvent.submit(screen.getByTestId('address-input'));

      expect(onSubmit).not.toHaveBeenCalled();
    });

    it('should NOT submit when disabled', () => {
      const onSubmit = vi.fn();
      render(<AddressInput onSubmit={onSubmit} disabled />);

      const input = screen.getByTestId('address-input-field');
      fireEvent.change(input, { target: { value: '123 Main St' } });
      fireEvent.submit(screen.getByTestId('address-input'));

      expect(onSubmit).not.toHaveBeenCalled();
    });
  });

  describe('button states', () => {
    it('should disable submit button when address is empty', () => {
      render(<AddressInput {...defaultProps} />);

      expect(screen.getByTestId('address-input-submit')).toBeDisabled();
    });

    it('should disable submit button when address is too short', () => {
      render(<AddressInput {...defaultProps} />);

      const input = screen.getByTestId('address-input-field');
      fireEvent.change(input, { target: { value: 'Hi' } });

      expect(screen.getByTestId('address-input-submit')).toBeDisabled();
    });

    it('should enable submit button when address is valid (5+ chars)', () => {
      render(<AddressInput {...defaultProps} />);

      const input = screen.getByTestId('address-input-field');
      fireEvent.change(input, { target: { value: '123 Main' } });

      expect(screen.getByTestId('address-input-submit')).not.toBeDisabled();
    });

    it('should disable submit button when loading', () => {
      render(<AddressInput {...defaultProps} isLoading />);

      const input = screen.getByTestId('address-input-field');
      fireEvent.change(input, { target: { value: '123 Main St' } });

      expect(screen.getByTestId('address-input-submit')).toBeDisabled();
    });

    it('should disable submit button when disabled', () => {
      render(<AddressInput {...defaultProps} disabled />);

      const input = screen.getByTestId('address-input-field');
      fireEvent.change(input, { target: { value: '123 Main St' } });

      expect(screen.getByTestId('address-input-submit')).toBeDisabled();
    });
  });

  describe('disabled state', () => {
    it('should disable input when disabled prop is true', () => {
      render(<AddressInput {...defaultProps} disabled />);

      expect(screen.getByTestId('address-input-field')).toBeDisabled();
    });

    it('should disable input when loading', () => {
      render(<AddressInput {...defaultProps} isLoading />);

      expect(screen.getByTestId('address-input-field')).toBeDisabled();
    });
  });
});
