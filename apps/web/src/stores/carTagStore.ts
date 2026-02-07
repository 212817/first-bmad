// apps/web/src/stores/carTagStore.ts
import { create } from 'zustand';
import { apiClient } from '@/services/api/client';
import { indexedDbService } from '@/services/storage/indexedDb.service';
import { STORES } from '@/services/storage/types';
import { useGuestStore } from './guestStore';
import type { CarTag } from '@/components/spot/carTag.types';

/**
 * Default tags available when offline or for guest users
 */
const DEFAULT_TAGS: CarTag[] = [
  { id: 'default-home', name: 'Home', color: '#3B82F6', isDefault: true },
  { id: 'default-work', name: 'Work', color: '#10B981', isDefault: true },
  { id: 'default-my-car', name: 'My Car', color: '#8B5CF6', isDefault: true },
  { id: 'default-rental', name: 'Rental', color: '#F59E0B', isDefault: true },
  { id: 'default-other', name: 'Other', color: '#6B7280', isDefault: true },
];

/**
 * Car tag store state
 */
interface CarTagState {
  tags: CarTag[];
  isLoading: boolean;
  error: string | null;
  isHydrated: boolean;
}

/**
 * Car tag store actions
 */
interface CarTagActions {
  fetchTags: () => Promise<void>;
  createTag: (name: string, color?: string) => Promise<CarTag>;
  updateTag: (id: string, data: { name?: string; color?: string }) => Promise<CarTag | null>;
  deleteTag: (id: string) => Promise<boolean>;
  getTagById: (id: string) => CarTag | undefined;
  setError: (error: string | null) => void;
}

/**
 * Car tag store for managing car tags
 * Routes to API (authenticated) or IndexedDB (guest) based on auth mode
 */
export const useCarTagStore = create<CarTagState & CarTagActions>((set, get) => ({
  tags: DEFAULT_TAGS,
  isLoading: false,
  error: null,
  isHydrated: false,

  /**
   * Fetch tags from API or IndexedDB
   */
  fetchTags: async () => {
    set({ isLoading: true, error: null });

    const isGuest = useGuestStore.getState().isGuest;

    try {
      if (isGuest) {
        // Get custom tags from IndexedDB for guest users
        const customTags = await indexedDbService.getItem<CarTag[]>(STORES.settings, 'carTags');
        set({
          tags: [...DEFAULT_TAGS, ...(customTags || [])],
          isLoading: false,
          isHydrated: true,
        });
      } else {
        // Fetch from API for authenticated users
        const response = await apiClient.get<{ success: boolean; data: CarTag[] }>('/v1/car-tags');
        const apiTags = response.data.data;

        // Use API tags directly - they include defaults (seeded by backend) and custom tags
        // Fall back to frontend defaults only if API returns empty (e.g., backend seeding failed)
        set({
          tags: apiTags.length > 0 ? apiTags : DEFAULT_TAGS,
          isLoading: false,
          isHydrated: true,
        });
      }
    } catch {
      // Fallback to defaults on error
      set({
        tags: DEFAULT_TAGS,
        isLoading: false,
        isHydrated: true,
        error: 'Failed to fetch tags',
      });
    }
  },

  /**
   * Create a new custom tag
   */
  createTag: async (name: string, color = '#3B82F6') => {
    const isGuest = useGuestStore.getState().isGuest;

    if (isGuest) {
      // Create tag locally for guest users
      const newTag: CarTag = {
        id: crypto.randomUUID(),
        name: name.trim(),
        color,
        isDefault: false,
      };

      const existingCustom = get().tags.filter((t) => !t.isDefault);
      const allCustom = [...existingCustom, newTag];
      await indexedDbService.setItem(STORES.settings, 'carTags', allCustom);

      set((state) => ({ tags: [...state.tags, newTag] }));
      return newTag;
    } else {
      // Create via API for authenticated users
      const response = await apiClient.post<{ success: boolean; data: CarTag }>('/v1/car-tags', {
        name: name.trim(),
        color,
      });

      const newTag = response.data.data;
      set((state) => ({ tags: [...state.tags, newTag] }));
      return newTag;
    }
  },

  /**
   * Update an existing custom tag
   */
  updateTag: async (id: string, data: { name?: string; color?: string }) => {
    const isGuest = useGuestStore.getState().isGuest;
    const existing = get().tags.find((t) => t.id === id);

    if (!existing || existing.isDefault) {
      return null;
    }

    if (isGuest) {
      // Update locally for guest users
      const updatedTag: CarTag = {
        ...existing,
        name: data.name?.trim() || existing.name,
        color: data.color || existing.color,
      };

      const customTags = get()
        .tags.filter((t) => !t.isDefault)
        .map((t) => (t.id === id ? updatedTag : t));
      await indexedDbService.setItem(STORES.settings, 'carTags', customTags);

      set((state) => ({
        tags: state.tags.map((t) => (t.id === id ? updatedTag : t)),
      }));
      return updatedTag;
    } else {
      // Update via API for authenticated users
      const response = await apiClient.patch<{ success: boolean; data: CarTag }>(
        `/v1/car-tags/${id}`,
        data
      );

      const updatedTag = response.data.data;
      set((state) => ({
        tags: state.tags.map((t) => (t.id === id ? updatedTag : t)),
      }));
      return updatedTag;
    }
  },

  /**
   * Delete a custom tag
   */
  deleteTag: async (id: string) => {
    const isGuest = useGuestStore.getState().isGuest;
    const existing = get().tags.find((t) => t.id === id);

    if (!existing || existing.isDefault) {
      return false;
    }

    if (isGuest) {
      // Delete locally for guest users
      const customTags = get()
        .tags.filter((t) => !t.isDefault)
        .filter((t) => t.id !== id);
      await indexedDbService.setItem(STORES.settings, 'carTags', customTags);

      set((state) => ({
        tags: state.tags.filter((t) => t.id !== id),
      }));
      return true;
    } else {
      // Delete via API for authenticated users
      await apiClient.delete(`/v1/car-tags/${id}`);

      set((state) => ({
        tags: state.tags.filter((t) => t.id !== id),
      }));
      return true;
    }
  },

  /**
   * Get a tag by ID
   */
  getTagById: (id: string) => {
    const tags = get().tags;
    return tags.find((t) => t.id === id);
  },

  /**
   * Set error message
   */
  setError: (error: string | null) => {
    set({ error });
  },
}));
