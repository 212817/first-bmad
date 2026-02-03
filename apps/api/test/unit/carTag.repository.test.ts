// apps/api/test/unit/carTag.repository.test.ts
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { carTagRepository } from '../../src/repositories/carTag.repository.js';
import { db } from '../../src/config/db.js';

// Mock the database
vi.mock('../../src/config/db.js', () => ({
  db: {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
}));

vi.mock('@repo/shared/db', () => ({
  carTags: {
    id: 'id',
    userId: 'userId',
    name: 'name',
    color: 'color',
    isDefault: 'isDefault',
    createdAt: 'createdAt',
  },
}));

describe('CarTagRepository', () => {
  const mockDefaultTagRow = {
    id: 'default-my-car',
    userId: null,
    name: 'My Car',
    color: '#3B82F6',
    isDefault: true,
    createdAt: new Date('2026-01-15T12:00:00Z'),
  };

  const mockCustomTagRow = {
    id: 'tag-123',
    userId: 'user-123',
    name: 'Family Van',
    color: '#8B5CF6',
    isDefault: false,
    createdAt: new Date('2026-01-20T10:00:00Z'),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDefaults', () => {
    it('should return all default tags', async () => {
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockResolvedValue([mockDefaultTagRow]);

      vi.mocked(db.select).mockReturnValue({
        from: mockFrom,
      } as any);
      mockFrom.mockReturnValue({ where: mockWhere });

      const result = await carTagRepository.getDefaults();

      expect(result).toHaveLength(1);
      expect(result[0]!.name).toBe('My Car');
      expect(result[0]!.isDefault).toBe(true);
      expect(result[0]!.userId).toBeNull();
    });

    it('should return empty array when no defaults exist', async () => {
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockResolvedValue([]);

      vi.mocked(db.select).mockReturnValue({
        from: mockFrom,
      } as any);
      mockFrom.mockReturnValue({ where: mockWhere });

      const result = await carTagRepository.getDefaults();

      expect(result).toHaveLength(0);
    });
  });

  describe('findByUserId', () => {
    it('should return user custom tags', async () => {
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockResolvedValue([mockCustomTagRow]);

      vi.mocked(db.select).mockReturnValue({
        from: mockFrom,
      } as any);
      mockFrom.mockReturnValue({ where: mockWhere });

      const result = await carTagRepository.findByUserId('user-123');

      expect(result).toHaveLength(1);
      expect(result[0]!.name).toBe('Family Van');
      expect(result[0]!.userId).toBe('user-123');
      expect(result[0]!.isDefault).toBe(false);
    });

    it('should return empty array when user has no custom tags', async () => {
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockResolvedValue([]);

      vi.mocked(db.select).mockReturnValue({
        from: mockFrom,
      } as any);
      mockFrom.mockReturnValue({ where: mockWhere });

      const result = await carTagRepository.findByUserId('user-456');

      expect(result).toHaveLength(0);
    });
  });

  describe('findById', () => {
    it('should return tag when found', async () => {
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([mockCustomTagRow]);

      vi.mocked(db.select).mockReturnValue({
        from: mockFrom,
      } as any);
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });

      const result = await carTagRepository.findById('tag-123');

      expect(result).not.toBeNull();
      expect(result?.id).toBe('tag-123');
      expect(result?.name).toBe('Family Van');
    });

    it('should return null when tag not found', async () => {
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([]);

      vi.mocked(db.select).mockReturnValue({
        from: mockFrom,
      } as any);
      mockFrom.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ limit: mockLimit });

      const result = await carTagRepository.findById('nonexistent');

      expect(result).toBeNull();
    });
  });

  describe('create', () => {
    it('should create a new custom tag', async () => {
      const mockValues = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockResolvedValue([mockCustomTagRow]);

      vi.mocked(db.insert).mockReturnValue({
        values: mockValues,
      } as any);
      mockValues.mockReturnValue({ returning: mockReturning });

      const result = await carTagRepository.create({
        userId: 'user-123',
        name: 'Family Van',
        color: '#8B5CF6',
      });

      expect(result).not.toBeNull();
      expect(result.id).toBe('tag-123');
      expect(result.name).toBe('Family Van');
      expect(result.color).toBe('#8B5CF6');
      expect(result.isDefault).toBe(false);
    });

    it('should use default color if not provided', async () => {
      const mockValues = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockResolvedValue([{ ...mockCustomTagRow, color: '#3B82F6' }]);

      vi.mocked(db.insert).mockReturnValue({
        values: mockValues,
      } as any);
      mockValues.mockReturnValue({ returning: mockReturning });

      const result = await carTagRepository.create({
        userId: 'user-123',
        name: 'Work Car',
      });

      expect(result.color).toBe('#3B82F6');
    });
  });

  describe('createDefault', () => {
    it('should create a system default tag with null userId', async () => {
      const defaultTagRow = {
        id: 'default-tag-123',
        userId: null,
        name: 'My Car',
        color: '#3B82F6',
        isDefault: true,
        createdAt: new Date(),
      };
      const mockValues = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockResolvedValue([defaultTagRow]);

      vi.mocked(db.insert).mockReturnValue({
        values: mockValues,
      } as any);
      mockValues.mockReturnValue({ returning: mockReturning });

      const result = await carTagRepository.createDefault('My Car', '#3B82F6');

      expect(result).not.toBeNull();
      expect(result.id).toBe('default-tag-123');
      expect(result.name).toBe('My Car');
      expect(result.color).toBe('#3B82F6');
      expect(result.isDefault).toBe(true);
      expect(result.userId).toBeNull();
    });
  });

  describe('update', () => {
    it('should update tag name', async () => {
      const updatedRow = { ...mockCustomTagRow, name: 'Updated Name' };
      const mockSet = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockResolvedValue([updatedRow]);

      vi.mocked(db.update).mockReturnValue({
        set: mockSet,
      } as any);
      mockSet.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ returning: mockReturning });

      const result = await carTagRepository.update('tag-123', { name: 'Updated Name' });

      expect(result).not.toBeNull();
      expect(result?.name).toBe('Updated Name');
    });

    it('should update tag color', async () => {
      const updatedRow = { ...mockCustomTagRow, color: '#FF0000' };
      const mockSet = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockResolvedValue([updatedRow]);

      vi.mocked(db.update).mockReturnValue({
        set: mockSet,
      } as any);
      mockSet.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ returning: mockReturning });

      const result = await carTagRepository.update('tag-123', { color: '#FF0000' });

      expect(result).not.toBeNull();
      expect(result?.color).toBe('#FF0000');
    });

    it('should return null when tag not found', async () => {
      const mockSet = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockResolvedValue([]);

      vi.mocked(db.update).mockReturnValue({
        set: mockSet,
      } as any);
      mockSet.mockReturnValue({ where: mockWhere });
      mockWhere.mockReturnValue({ returning: mockReturning });

      const result = await carTagRepository.update('nonexistent', { name: 'New Name' });

      expect(result).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete tag and return true', async () => {
      const mockWhere = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockResolvedValue([mockCustomTagRow]);

      vi.mocked(db.delete).mockReturnValue({
        where: mockWhere,
      } as any);
      mockWhere.mockReturnValue({ returning: mockReturning });

      const result = await carTagRepository.delete('tag-123');

      expect(result).toBe(true);
    });

    it('should return false when tag not found', async () => {
      const mockWhere = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockResolvedValue([]);

      vi.mocked(db.delete).mockReturnValue({
        where: mockWhere,
      } as any);
      mockWhere.mockReturnValue({ returning: mockReturning });

      const result = await carTagRepository.delete('nonexistent');

      expect(result).toBe(false);
    });
  });
});
