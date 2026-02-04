// apps/web/src/components/prompts/types.ts

export interface SignInPromptProps {
  onSignIn: () => void;
  onDismiss: () => void;
}

export interface LocationPermissionPromptProps {
  onEnableLocation: () => void;
  onEnterManually: () => void;
  onDismiss?: () => void;
  isLoading?: boolean;
  /** If true, shows instructions for enabling permission in settings (for iOS Safari) */
  permissionDenied?: boolean;
}
