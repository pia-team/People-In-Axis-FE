import { describe, it, expect, vi, beforeEach } from 'vitest';
import { departmentService } from '@/services/departmentService';
import { apiClient } from '@/services/api';
import type { Department, PaginatedResponse } from '@/types';

vi.mock('@/services/api');
vi.mock('@/config/apiPaths', () => ({
  apiPath: (path: string) => `/api${path}`,
}));

describe('DepartmentService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('returns paginated departments', async () => {
      const mockResponse: PaginatedResponse<Department> = {
        content: [
          {
            id: 1,
            name: 'Engineering',
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

      const result = await departmentService.getAll();
      expect(result.content).toHaveLength(1);
      expect(result.pageInfo.totalElements).toBe(1);
      expect(apiClient.get).toHaveBeenCalledWith('/departments', { params: undefined });
    });

    it('returns paginated departments with filters', async () => {
      const mockResponse: PaginatedResponse<Department> = {
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
        search: 'Engineering',
        companyId: 1,
      };
      await departmentService.getAll(params);
      expect(apiClient.get).toHaveBeenCalledWith('/departments', { params });
    });
  });

  describe('getById', () => {
    it('returns a single department', async () => {
      const mockDepartment: Department = {
        id: 1,
        name: 'Engineering',
        companyId: 1,
      };
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockDepartment } as any);

      const result = await departmentService.getById(1);
      expect(result).toEqual(mockDepartment);
      expect(apiClient.get).toHaveBeenCalledWith('/departments/1');
    });
  });

  describe('getByCompany', () => {
    it('returns departments by company', async () => {
      const mockDepartments: Department[] = [
        {
          id: 1,
          name: 'Engineering',
          companyId: 1,
        },
      ];
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockDepartments } as any);

      const result = await departmentService.getByCompany(1);
      expect(result).toEqual(mockDepartments);
      expect(apiClient.get).toHaveBeenCalledWith('/departments/company/1');
    });
  });

  describe('create', () => {
    it('creates a new department', async () => {
      const createData = {
        name: 'Engineering',
        companyId: 1,
      };
      const mockDepartment: Department = {
        id: 1,
        ...createData,
      };
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockDepartment } as any);

      const result = await departmentService.create(createData);
      expect(result).toEqual(mockDepartment);
      expect(apiClient.post).toHaveBeenCalledWith('/departments', createData);
    });
  });

  describe('update', () => {
    it('updates a department', async () => {
      const updateData = {
        name: 'Updated Engineering',
      };
      const mockDepartment: Department = {
        id: 1,
        name: 'Updated Engineering',
        companyId: 1,
      };
      vi.mocked(apiClient.put).mockResolvedValue({ data: mockDepartment } as any);

      const result = await departmentService.update(1, updateData);
      expect(result).toEqual(mockDepartment);
      expect(apiClient.put).toHaveBeenCalledWith('/departments/1', updateData);
    });
  });

  describe('delete', () => {
    it('deletes a department', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({} as any);

      await departmentService.delete(1);
      expect(apiClient.delete).toHaveBeenCalledWith('/departments/1');
    });
  });
});

