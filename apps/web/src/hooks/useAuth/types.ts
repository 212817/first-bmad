// apps/web/src/hooks/useAuth/types.ts
import type { CurrentUser } from '@/stores/types';

/**
 * Auth hook return type
 */
export interface UseAuthReturn {
  user: CurrentUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (provider: 'google' | 'apple') => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}
