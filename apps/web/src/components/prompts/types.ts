// apps/web/src/components/prompts/types.ts

export interface SignInPromptProps {
  onSignIn: () => void;
  onDismiss: () => void;
}

export interface LocationPermissionPromptProps {
  onEnableLocation: () => void;
  onEnterManually: () => void;
  isLoading?: boolean;
}
