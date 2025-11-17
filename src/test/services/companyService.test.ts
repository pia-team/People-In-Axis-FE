import { describe, it, expect, vi, beforeEach } from 'vitest';
import { companyService } from '@/services/companyService';
import { apiClient } from '@/services/api';
import type { Company, PaginatedResponse } from '@/types';

vi.mock('@/services/api');
vi.mock('@/config/apiPaths', () => ({
  apiPath: (path: string) => `/api${path}`,
}));

describe('CompanyService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('returns paginated companies', async () => {
      const mockResponse: PaginatedResponse<Company> = {
        content: [
          {
            id: 1,
            name: 'Test Company',
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

      const result = await companyService.getAll();
      expect(result.content).toHaveLength(1);
      expect(result.pageInfo.totalElements).toBe(1);
      expect(apiClient.get).toHaveBeenCalledWith('/companies', { params: undefined });
    });

    it('returns paginated companies with filters', async () => {
      const mockResponse: PaginatedResponse<Company> = {
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
      };
      await companyService.getAll(params);
      expect(apiClient.get).toHaveBeenCalledWith('/companies', { params });
    });
  });

  describe('getById', () => {
    it('returns a single company', async () => {
      const mockCompany: Company = {
        id: 1,
        name: 'Test Company',
      };
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockCompany } as any);

      const result = await companyService.getById(1);
      expect(result).toEqual(mockCompany);
      expect(apiClient.get).toHaveBeenCalledWith('/companies/1');
    });
  });

  describe('getParents', () => {
    it('returns parent companies', async () => {
      const mockCompanies: Company[] = [
        {
          id: 1,
          name: 'Parent Company',
        },
      ];
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockCompanies } as any);

      const result = await companyService.getParents();
      expect(result).toEqual(mockCompanies);
      expect(apiClient.get).toHaveBeenCalledWith('/companies/parents');
    });
  });

  describe('getSubsidiaries', () => {
    it('returns subsidiaries of a company', async () => {
      const mockCompanies: Company[] = [
        {
          id: 2,
          name: 'Subsidiary Company',
        },
      ];
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockCompanies } as any);

      const result = await companyService.getSubsidiaries(1);
      expect(result).toEqual(mockCompanies);
      expect(apiClient.get).toHaveBeenCalledWith('/companies/1/subsidiaries');
    });
  });

  describe('create', () => {
    it('creates a new company', async () => {
      const createData = {
        name: 'Test Company',
      };
      const mockCompany: Company = {
        id: 1,
        ...createData,
      };
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockCompany } as any);

      const result = await companyService.create(createData);
      expect(result).toEqual(mockCompany);
      expect(apiClient.post).toHaveBeenCalledWith('/companies', createData);
    });
  });

  describe('update', () => {
    it('updates a company', async () => {
      const updateData = {
        name: 'Updated Company',
      };
      const mockCompany: Company = {
        id: 1,
        ...updateData,
      };
      vi.mocked(apiClient.put).mockResolvedValue({ data: mockCompany } as any);

      const result = await companyService.update(1, updateData);
      expect(result).toEqual(mockCompany);
      expect(apiClient.put).toHaveBeenCalledWith('/companies/1', updateData);
    });
  });

  describe('delete', () => {
    it('deletes a company', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({} as any);

      await companyService.delete(1);
      expect(apiClient.delete).toHaveBeenCalledWith('/companies/1');
    });
  });
});

