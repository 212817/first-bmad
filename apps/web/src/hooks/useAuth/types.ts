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
  login: (provider: 'google' | 'apple') => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}
