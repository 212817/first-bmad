// apps/web/src/stores/__tests__/carTagStore.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { useCarTagStore } from '../carTagStore';
import { indexedDbService } from '@/services/storage/indexedDb.service';
import { apiClient } from '@/services/api/client';
import { useGuestStore } from '../guestStore';

// Mock IndexedDB service
vi.mock('@/services/storage/indexedDb.service', () => ({
  indexedDbService: {
    init: vi.fn().mockResolvedValue(undefined),
    getItem: vi.fn().mockResolvedValue(null),
    setItem: vi.fn().mockResolvedValue(undefined),
    deleteItem: vi.fn().mockResolvedValue(undefined),
  },
}));

// Mock API client
vi.mock('@/services/api/client', () => ({
  apiClient: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock crypto.randomUUID
vi.stubGlobal('crypto', {
  randomUUID: vi.fn(() => 'test-uuid-1234'),
});

const DEFAULT_TAGS = [
  { id: 'default-home', name: 'Home', color: '#3B82F6', isDefault: true },
  { id: 'default-work', name: 'Work', color: '#10B981', isDefault: true },
  { id: 'default-my-car', name: 'My Car', color: '#8B5CF6', isDefault: true },
  { id: 'default-rental', name: 'Rental', color: '#F59E0B', isDefault: true },
  { id: 'default-other', name: 'Other', color: '#6B7280', isDefault: true },
];

describe('carTagStore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset store to initial state
    useCarTagStore.setState({
      tags: DEFAULT_TAGS,
      isLoading: false,
      error: null,
      isHydrated: false,
    });
    // Reset guest store
    useGuestStore.setState({
      isGuest: false,
      guestSessionId: null,
      createdAt: null,
      isHydrated: false,
    });
  });

  describe('initial state', () => {
    it('should have default tags on init', () => {
      const state = useCarTagStore.getState();

      expect(state.tags).toHaveLength(5);
      expect(state.tags[0]?.name).toBe('Home');
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('fetchTags (guest mode)', () => {
    beforeEach(() => {
      useGuestStore.setState({ isGuest: true, isHydrated: true });
    });

    it('should return defaults when no custom tags', async () => {
      vi.mocked(indexedDbService.getItem).mockResolvedValue(null);

      await useCarTagStore.getState().fetchTags();

      const state = useCarTagStore.getState();
      expect(state.tags).toHaveLength(5);
      expect(state.isHydrated).toBe(true);
    });

    it('should merge defaults with custom tags from IndexedDB', async () => {
      const customTags = [{ id: 'custom-1', name: 'Work Car', color: '#FF0000', isDefault: false }];
      vi.mocked(indexedDbService.getItem).mockResolvedValue(customTags);

      await useCarTagStore.getState().fetchTags();

      const state = useCarTagStore.getState();
      expect(state.tags).toHaveLength(6);
      expect(state.tags[5]?.name).toBe('Work Car');
    });
  });

  describe('fetchTags (authenticated mode)', () => {
    it('should fetch tags from API', async () => {
      const apiTags = [
        { id: 'api-1', name: 'Home', color: '#3B82F6', isDefault: true },
        { id: 'api-2', name: 'Custom', color: '#FF0000', isDefault: false },
      ];
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { success: true, data: apiTags },
      });

      await useCarTagStore.getState().fetchTags();

      const state = useCarTagStore.getState();
      expect(state.tags).toEqual(apiTags);
      expect(apiClient.get).toHaveBeenCalledWith('/v1/car-tags');
    });

    it('should fallback to defaults when API returns empty array', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: { success: true, data: [] },
      });

      await useCarTagStore.getState().fetchTags();

      const state = useCarTagStore.getState();
      expect(state.tags).toHaveLength(5);
      expect(state.tags[0]?.name).toBe('Home');
      expect(state.isLoading).toBe(false);
      expect(state.isHydrated).toBe(true);
    });

    it('should fallback to defaults on API error', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Network error'));

      await useCarTagStore.getState().fetchTags();

      const state = useCarTagStore.getState();
      expect(state.tags).toHaveLength(5);
      expect(state.error).toBe('Failed to fetch tags');
    });
  });

  describe('createTag (guest mode)', () => {
    beforeEach(() => {
      useGuestStore.setState({ isGuest: true, isHydrated: true });
    });

    it('should create tag locally and persist to IndexedDB', async () => {
      const newTag = await useCarTagStore.getState().createTag('Family Van', '#8B5CF6');

      expect(newTag.id).toBe('test-uuid-1234');
      expect(newTag.name).toBe('Family Van');
      expect(newTag.color).toBe('#8B5CF6');
      expect(newTag.isDefault).toBe(false);

      const state = useCarTagStore.getState();
      expect(state.tags).toHaveLength(6); // 5 defaults + 1 new
      expect(indexedDbService.setItem).toHaveBeenCalled();
    });
  });

  describe('createTag (authenticated mode)', () => {
    it('should create tag via API', async () => {
      const apiTag = {
        id: 'api-tag-1',
        name: 'Work Car',
        color: '#FF0000',
        isDefault: false,
      };
      vi.mocked(apiClient.post).mockResolvedValue({
        data: { success: true, data: apiTag },
      });

      const newTag = await useCarTagStore.getState().createTag('Work Car', '#FF0000');

      expect(newTag).toEqual(apiTag);
      expect(apiClient.post).toHaveBeenCalledWith('/v1/car-tags', {
        name: 'Work Car',
        color: '#FF0000',
      });
    });
  });

  describe('updateTag', () => {
    beforeEach(() => {
      useCarTagStore.setState({
        tags: [
          ...DEFAULT_TAGS,
          { id: 'custom-1', name: 'Old Name', color: '#000000', isDefault: false },
        ],
        isLoading: false,
        error: null,
        isHydrated: true,
      });
    });

    it('should return null when trying to update default tag', async () => {
      const result = await useCarTagStore
        .getState()
        .updateTag('default-my-car', { name: 'Hacked' });

      expect(result).toBeNull();
    });

    it('should update custom tag (guest mode)', async () => {
      useGuestStore.setState({ isGuest: true, isHydrated: true });

      const result = await useCarTagStore.getState().updateTag('custom-1', { name: 'New Name' });

      expect(result?.name).toBe('New Name');
      expect(indexedDbService.setItem).toHaveBeenCalled();
    });
  });

  describe('deleteTag', () => {
    beforeEach(() => {
      useCarTagStore.setState({
        tags: [
          ...DEFAULT_TAGS,
          { id: 'custom-1', name: 'To Delete', color: '#000000', isDefault: false },
        ],
        isLoading: false,
        error: null,
        isHydrated: true,
      });
    });

    it('should return false when trying to delete default tag', async () => {
      const result = await useCarTagStore.getState().deleteTag('default-my-car');

      expect(result).toBe(false);
    });

    it('should delete custom tag (guest mode)', async () => {
      useGuestStore.setState({ isGuest: true, isHydrated: true });

      const result = await useCarTagStore.getState().deleteTag('custom-1');

      expect(result).toBe(true);
      const state = useCarTagStore.getState();
      expect(state.tags).toHaveLength(5); // Only defaults left
    });
  });

  describe('getTagById', () => {
    it('should return tag when found', () => {
      const tag = useCarTagStore.getState().getTagById('default-home');

      expect(tag?.name).toBe('Home');
    });

    it('should return undefined when not found', () => {
      const tag = useCarTagStore.getState().getTagById('nonexistent');

      expect(tag).toBeUndefined();
    });
  });
});
