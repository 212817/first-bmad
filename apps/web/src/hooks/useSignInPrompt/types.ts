// apps/web/src/hooks/useSignInPrompt/types.ts

export interface UseSignInPromptReturn {
  showPrompt: boolean;
  dismiss: () => Promise<void>;
  triggerAfterSpotSave: () => Promise<void>;
}
