// apps/web/src/components/timer/__tests__/MeterTimerInput.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MeterTimerInput } from '../MeterTimerInput';

describe('MeterTimerInput', () => {
  const mockOnChange = vi.fn();
  const fixedNow = new Date('2026-02-06T12:00:00Z').getTime();

  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    vi.setSystemTime(fixedNow);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('should render with label and presets', () => {
    render(<MeterTimerInput onChange={mockOnChange} />);

    expect(screen.getByText('Meter Timer (optional)')).toBeInTheDocument();
    expect(screen.getByTestId('preset-30')).toHaveTextContent('30 min');
    expect(screen.getByTestId('preset-60')).toHaveTextContent('1 hour');
    expect(screen.getByTestId('preset-120')).toHaveTextContent('2 hours');
  });

  it('should call onChange with correct ISO string when 30min preset is clicked', () => {
    render(<MeterTimerInput onChange={mockOnChange} />);

    fireEvent.click(screen.getByTestId('preset-30'));

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    const calledArg = mockOnChange.mock.calls[0]?.[0] as string;
    const expectedTime = new Date(fixedNow + 30 * 60 * 1000);
    expect(calledArg).toBe(expectedTime.toISOString());
  });

  it('should call onChange with correct ISO string when 1 hour preset is clicked', () => {
    render(<MeterTimerInput onChange={mockOnChange} />);

    fireEvent.click(screen.getByTestId('preset-60'));

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    const calledArg = mockOnChange.mock.calls[0]?.[0] as string;
    const expectedTime = new Date(fixedNow + 60 * 60 * 1000);
    expect(calledArg).toBe(expectedTime.toISOString());
  });

  it('should call onChange with correct ISO string when 2 hours preset is clicked', () => {
    render(<MeterTimerInput onChange={mockOnChange} />);

    fireEvent.click(screen.getByTestId('preset-120'));

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    const calledArg = mockOnChange.mock.calls[0]?.[0] as string;
    const expectedTime = new Date(fixedNow + 120 * 60 * 1000);
    expect(calledArg).toBe(expectedTime.toISOString());
  });

  it('should handle custom minutes input', () => {
    render(<MeterTimerInput onChange={mockOnChange} />);

    const input = screen.getByTestId('custom-minutes-input');
    fireEvent.change(input, { target: { value: '45' } });
    fireEvent.click(screen.getByTestId('set-custom-button'));

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    const calledArg = mockOnChange.mock.calls[0]?.[0] as string;
    const expectedTime = new Date(fixedNow + 45 * 60 * 1000);
    expect(calledArg).toBe(expectedTime.toISOString());
  });

  it('should not call onChange for invalid custom minutes (zero)', () => {
    render(<MeterTimerInput onChange={mockOnChange} />);

    const input = screen.getByTestId('custom-minutes-input');
    fireEvent.change(input, { target: { value: '0' } });
    fireEvent.click(screen.getByTestId('set-custom-button'));

    expect(mockOnChange).not.toHaveBeenCalled();
  });

  it('should not call onChange for empty custom input', () => {
    render(<MeterTimerInput onChange={mockOnChange} />);

    // Set custom button should be disabled when input is empty
    expect(screen.getByTestId('set-custom-button')).toBeDisabled();
  });

  it('should display current timer when value is set', () => {
    const futureTime = new Date(fixedNow + 60 * 60 * 1000).toISOString();
    render(<MeterTimerInput value={futureTime} onChange={mockOnChange} />);

    expect(screen.getByTestId('timer-status')).toBeInTheDocument();
    expect(screen.getByTestId('clear-timer-button')).toBeInTheDocument();
  });

  it('should call onChange with null when clear is clicked', () => {
    const futureTime = new Date(fixedNow + 60 * 60 * 1000).toISOString();
    render(<MeterTimerInput value={futureTime} onChange={mockOnChange} />);

    fireEvent.click(screen.getByTestId('clear-timer-button'));

    expect(mockOnChange).toHaveBeenCalledWith(null);
  });

  it('should disable all inputs when disabled prop is true', () => {
    render(<MeterTimerInput onChange={mockOnChange} disabled />);

    expect(screen.getByTestId('preset-30')).toBeDisabled();
    expect(screen.getByTestId('preset-60')).toBeDisabled();
    expect(screen.getByTestId('preset-120')).toBeDisabled();
    expect(screen.getByTestId('custom-minutes-input')).toBeDisabled();
    expect(screen.getByTestId('set-custom-button')).toBeDisabled();
  });

  it('should handle Enter key in custom input', () => {
    render(<MeterTimerInput onChange={mockOnChange} />);

    const input = screen.getByTestId('custom-minutes-input');
    fireEvent.change(input, { target: { value: '15' } });
    fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

    expect(mockOnChange).toHaveBeenCalledTimes(1);
    const calledArg = mockOnChange.mock.calls[0]?.[0] as string;
    const expectedTime = new Date(fixedNow + 15 * 60 * 1000);
    expect(calledArg).toBe(expectedTime.toISOString());
  });
});
