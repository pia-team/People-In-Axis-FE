import { describe, it, expect, vi, beforeEach } from 'vitest';
import { projectService } from '@/services/projectService';
import { apiClient } from '@/services/api';
import type { Project, PaginatedResponse } from '@/types';

vi.mock('@/services/api');
vi.mock('@/config/apiPaths', () => ({
  apiPath: (path: string) => `/api${path}`,
}));

describe('ProjectService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('returns paginated projects', async () => {
      const mockResponse: PaginatedResponse<Project> = {
        content: [
          {
            id: 1,
            name: 'Test Project',
            startDate: '2024-01-01',
            status: 'ACTIVE',
            companyId: 1,
          },
        ],
        pageInfo: {
          page: 0,
          size: 10,
          totalElements: 1,
          totalPages: 1,
        },
      };
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse } as any);

      const result = await projectService.getAll();
      expect(result.content).toHaveLength(1);
      expect(result.pageInfo.totalElements).toBe(1);
      expect(apiClient.get).toHaveBeenCalledWith('/projects', { params: undefined });
    });

    it('returns paginated projects with filters', async () => {
      const mockResponse: PaginatedResponse<Project> = {
        content: [],
        pageInfo: {
          page: 0,
          size: 10,
          totalElements: 0,
          totalPages: 0,
        },
      };
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse } as any);

      const params = {
        page: 0,
        size: 20,
        search: 'Test',
        companyId: 1,
      };
      await projectService.getAll(params);
      expect(apiClient.get).toHaveBeenCalledWith('/projects', { params });
    });
  });

  describe('getById', () => {
    it('returns a single project', async () => {
      const mockProject: Project = {
        id: 1,
        name: 'Test Project',
        startDate: '2024-01-01',
        status: 'ACTIVE',
        companyId: 1,
      };
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockProject } as any);

      const result = await projectService.getById(1);
      expect(result).toEqual(mockProject);
      expect(apiClient.get).toHaveBeenCalledWith('/projects/1');
    });
  });

  describe('create', () => {
    it('creates a new project', async () => {
      const createData = {
        name: 'Test Project',
        startDate: '2024-01-01',
        status: 'ACTIVE' as const,
        companyId: 1,
      };
      const mockProject: Project = {
        id: 1,
        ...createData,
      };
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockProject } as any);

      const result = await projectService.create(createData);
      expect(result).toEqual(mockProject);
      expect(apiClient.post).toHaveBeenCalledWith('/projects', createData);
    });
  });

  describe('update', () => {
    it('updates a project', async () => {
      const updateData = {
        name: 'Updated Project',
      };
      const mockProject: Project = {
        id: 1,
        name: 'Updated Project',
        startDate: '2024-01-01',
        status: 'ACTIVE',
        companyId: 1,
      };
      vi.mocked(apiClient.put).mockResolvedValue({ data: mockProject } as any);

      const result = await projectService.update(1, updateData);
      expect(result).toEqual(mockProject);
      expect(apiClient.put).toHaveBeenCalledWith('/projects/1', updateData);
    });
  });

  describe('delete', () => {
    it('deletes a project', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({} as any);

      await projectService.delete(1);
      expect(apiClient.delete).toHaveBeenCalledWith('/projects/1');
    });
  });
});

