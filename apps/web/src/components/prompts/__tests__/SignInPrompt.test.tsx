// apps/web/src/components/prompts/__tests__/SignInPrompt.test.tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { SignInPrompt } from '../SignInPrompt';

describe('SignInPrompt', () => {
  describe('rendering', () => {
    it('should render the title', () => {
      render(<SignInPrompt onSignIn={vi.fn()} onDismiss={vi.fn()} />);

      expect(screen.getByText('Sync your spots')).toBeInTheDocument();
    });

    it('should render the description', () => {
      render(<SignInPrompt onSignIn={vi.fn()} onDismiss={vi.fn()} />);

      expect(
        screen.getByText('Sign in to sync your parking spots across all your devices.')
      ).toBeInTheDocument();
    });

    it('should render the Sign In button', () => {
      render(<SignInPrompt onSignIn={vi.fn()} onDismiss={vi.fn()} />);

      expect(screen.getByRole('button', { name: 'Sign In' })).toBeInTheDocument();
    });

    it('should render the Maybe later button', () => {
      render(<SignInPrompt onSignIn={vi.fn()} onDismiss={vi.fn()} />);

      expect(screen.getByRole('button', { name: 'Maybe later' })).toBeInTheDocument();
    });

    it('should render the dismiss X button', () => {
      render(<SignInPrompt onSignIn={vi.fn()} onDismiss={vi.fn()} />);

      expect(screen.getByRole('button', { name: 'Dismiss' })).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onSignIn when Sign In button is clicked', () => {
      const onSignIn = vi.fn();
      render(<SignInPrompt onSignIn={onSignIn} onDismiss={vi.fn()} />);

      fireEvent.click(screen.getByRole('button', { name: 'Sign In' }));

      expect(onSignIn).toHaveBeenCalledTimes(1);
    });

    it('should call onDismiss when Maybe later button is clicked', () => {
      const onDismiss = vi.fn();
      render(<SignInPrompt onSignIn={vi.fn()} onDismiss={onDismiss} />);

      fireEvent.click(screen.getByRole('button', { name: 'Maybe later' }));

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });

    it('should call onDismiss when X button is clicked', () => {
      const onDismiss = vi.fn();
      render(<SignInPrompt onSignIn={vi.fn()} onDismiss={onDismiss} />);

      fireEvent.click(screen.getByRole('button', { name: 'Dismiss' }));

      expect(onDismiss).toHaveBeenCalledTimes(1);
    });
  });
});
