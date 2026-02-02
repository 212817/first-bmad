// apps/web/src/components/spot/__tests__/NoteInput.test.tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { NoteInput } from '../NoteInput';

describe('NoteInput', () => {
  const defaultProps = {
    value: '',
    onChange: vi.fn(),
    onSave: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('rendering', () => {
    it('should render textarea immediately', () => {
      render(<NoteInput {...defaultProps} />);

      expect(screen.getByTestId('note-input')).toBeInTheDocument();
      expect(screen.getByTestId('note-input-textarea')).toBeInTheDocument();
    });

    it('should show placeholder with examples', () => {
      render(<NoteInput {...defaultProps} />);

      const textarea = screen.getByTestId('note-input-textarea');
      expect(textarea).toHaveAttribute(
        'placeholder',
        'Add Note: P2, near elevator • Blue pillar • Row G'
      );
    });

    it('should show character counter', () => {
      render(<NoteInput {...defaultProps} />);

      expect(screen.getByTestId('note-input-counter')).toHaveTextContent('0/500');
    });

    it('should display existing value', () => {
      render(<NoteInput {...defaultProps} value="Near the elevator" />);

      const textarea = screen.getByTestId('note-input-textarea');
      expect(textarea).toHaveValue('Near the elevator');
    });
  });

  describe('input handling', () => {
    it('should call onChange when text is entered', () => {
      const onChange = vi.fn();
      render(<NoteInput {...defaultProps} onChange={onChange} />);

      const textarea = screen.getByTestId('note-input-textarea');
      fireEvent.change(textarea, { target: { value: 'Test note' } });

      expect(onChange).toHaveBeenCalledWith('Test note');
    });

    it('should update character counter on input', () => {
      render(<NoteInput {...defaultProps} value="Hello" />);

      expect(screen.getByTestId('note-input-counter')).toHaveTextContent('5/500');
    });

    it('should call onSave on blur when value exists', () => {
      const onSave = vi.fn();
      render(<NoteInput {...defaultProps} value="Test note" onSave={onSave} />);

      const textarea = screen.getByTestId('note-input-textarea');
      fireEvent.blur(textarea);

      expect(onSave).toHaveBeenCalled();
    });

    it('should NOT call onSave on blur when value is only whitespace', () => {
      const onSave = vi.fn();
      render(<NoteInput {...defaultProps} value="   " onSave={onSave} />);

      const textarea = screen.getByTestId('note-input-textarea');
      fireEvent.blur(textarea);

      expect(onSave).not.toHaveBeenCalled();
    });

    it('should NOT call onSave on blur when value is empty', () => {
      const onSave = vi.fn();
      render(<NoteInput {...defaultProps} value="" onSave={onSave} />);

      const textarea = screen.getByTestId('note-input-textarea');
      fireEvent.blur(textarea);

      expect(onSave).not.toHaveBeenCalled();
    });
  });

  describe('character limit', () => {
    it('should enforce max 500 characters', () => {
      const onChange = vi.fn();
      const longText = 'a'.repeat(600);
      render(<NoteInput {...defaultProps} onChange={onChange} />);

      const textarea = screen.getByTestId('note-input-textarea');
      fireEvent.change(textarea, { target: { value: longText } });

      expect(onChange).toHaveBeenCalledWith('a'.repeat(500));
    });

    it('should show warning color when near limit (>450)', () => {
      const nearLimitText = 'a'.repeat(455);
      render(<NoteInput {...defaultProps} value={nearLimitText} />);

      const counter = screen.getByTestId('note-input-counter');
      expect(counter).toHaveClass('text-amber-500');
    });

    it('should show error color when at limit (500)', () => {
      const atLimitText = 'a'.repeat(500);
      render(<NoteInput {...defaultProps} value={atLimitText} />);

      const counter = screen.getByTestId('note-input-counter');
      expect(counter).toHaveClass('text-red-500');
    });

    it('should show normal color when under 450', () => {
      const shortText = 'Short note';
      render(<NoteInput {...defaultProps} value={shortText} />);

      const counter = screen.getByTestId('note-input-counter');
      expect(counter).toHaveClass('text-gray-400');
    });
  });

  describe('disabled state', () => {
    it('should disable textarea when disabled prop is true', () => {
      render(<NoteInput {...defaultProps} disabled />);

      const textarea = screen.getByTestId('note-input-textarea');
      expect(textarea).toBeDisabled();
    });

    it('should apply disabled styles when disabled', () => {
      render(<NoteInput {...defaultProps} disabled />);

      const textarea = screen.getByTestId('note-input-textarea');
      expect(textarea).toHaveClass('opacity-50');
      expect(textarea).toHaveClass('cursor-not-allowed');
    });
  });
});
