// apps/web/src/hooks/useSignInPrompt/useSignInPrompt.ts
import { useEffect, useState, useRef } from 'react';
import { useGuestStore } from '@/stores/guestStore';
import { indexedDbService } from '@/services/storage/indexedDb.service';
import { STORES, type SettingsData } from '@/services/storage/types';
import type { UseSignInPromptReturn } from './types';

const SETTINGS_KEY = 'app';
const VISIT_THRESHOLD = 3;

/**
 * Hook to manage sign-in prompt display for guest users
 * Shows prompt after 3rd visit or after first spot save
 */
export const useSignInPrompt = (): UseSignInPromptReturn => {
  const { isGuest, isHydrated } = useGuestStore();
  const [showPrompt, setShowPrompt] = useState(false);
  const hasCheckedRef = useRef(false);
  const prevGuestStateRef = useRef<string | null>(null);

  // Check if prompt should be shown on mount
  useEffect(() => {
    // Track guest state changes to reset check flag
    const currentGuestState = `${isGuest}-${isHydrated}`;
    if (prevGuestStateRef.current !== null && prevGuestStateRef.current !== currentGuestState) {
      hasCheckedRef.current = false;
    }
    prevGuestStateRef.current = currentGuestState;

    if (!isGuest || !isHydrated || hasCheckedRef.current) {
      return;
    }

    const checkAndUpdateVisitCount = async () => {
      hasCheckedRef.current = true;
      try {
        const settings = await indexedDbService.getItem<SettingsData>(
          STORES.settings,
          SETTINGS_KEY
        );

        // Don't show if already dismissed
        if (settings?.signInPromptDismissed) {
          return;
        }

        const visitCount = (settings?.guestVisitCount ?? 0) + 1;

        // Update visit count
        await indexedDbService.setItem(STORES.settings, SETTINGS_KEY, {
          ...settings,
          guestVisitCount: visitCount,
        });

        // Show prompt on 3rd+ visit
        if (visitCount >= VISIT_THRESHOLD) {
          setShowPrompt(true);
        }
      } catch (error) {
        console.warn('Failed to check sign-in prompt:', error);
      }
    };

    checkAndUpdateVisitCount();
  }, [isGuest, isHydrated]);

  /**
   * Dismiss the prompt and persist dismissal
   */
  const dismiss = async (): Promise<void> => {
    setShowPrompt(false);

    try {
      const settings = await indexedDbService.getItem<SettingsData>(STORES.settings, SETTINGS_KEY);
      await indexedDbService.setItem(STORES.settings, SETTINGS_KEY, {
        ...settings,
        signInPromptDismissed: true,
        signInPromptLastShown: Date.now(),
      });
    } catch (error) {
      console.warn('Failed to persist prompt dismissal:', error);
    }
  };

  /**
   * Trigger prompt after first spot save (called from spot-saving code)
   */
  const triggerAfterSpotSave = async (): Promise<void> => {
    if (!isGuest) return;

    try {
      const settings = await indexedDbService.getItem<SettingsData>(STORES.settings, SETTINGS_KEY);

      // Don't show if already dismissed
      if (settings?.signInPromptDismissed) {
        return;
      }

      setShowPrompt(true);
    } catch (error) {
      console.warn('Failed to trigger sign-in prompt:', error);
    }
  };

  return {
    showPrompt,
    dismiss,
    triggerAfterSpotSave,
  };
};
