import { describe, it, expect, vi, beforeEach } from 'vitest';
import { employeeService } from '@/services/employeeService';
import { apiClient } from '@/services/api';
import type { Employee, PaginatedResponse } from '@/types';

vi.mock('@/services/api');
vi.mock('@/config/apiPaths', () => ({
  apiPath: (path: string) => `/api${path}`,
}));

describe('EmployeeService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('returns paginated employees', async () => {
      const mockResponse: PaginatedResponse<Employee> = {
        content: [
          {
            id: 1,
            firstName: 'John',
            lastName: 'Doe',
            email: 'john.doe@example.com',
            position: 'Developer',
            startDate: '2024-01-01',
            employmentType: 'FULL_TIME',
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

      const result = await employeeService.getAll();
      expect(result.content).toHaveLength(1);
      expect(result.pageInfo.totalElements).toBe(1);
      expect(apiClient.get).toHaveBeenCalledWith('/employees', { params: undefined });
    });

    it('returns paginated employees with filters', async () => {
      const mockResponse: PaginatedResponse<Employee> = {
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
        search: 'John',
        companyId: 1,
      };
      await employeeService.getAll(params);
      expect(apiClient.get).toHaveBeenCalledWith('/employees', { params });
    });
  });

  describe('getById', () => {
    it('returns a single employee', async () => {
      const mockEmployee: Employee = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        position: 'Developer',
        startDate: '2024-01-01',
        employmentType: 'FULL_TIME',
        companyId: 1,
      };
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockEmployee } as any);

      const result = await employeeService.getById(1);
      expect(result).toEqual(mockEmployee);
      expect(apiClient.get).toHaveBeenCalledWith('/employees/1');
    });
  });

  describe('getCurrentEmployee', () => {
    it('returns current employee', async () => {
      const mockEmployee: Employee = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        position: 'Developer',
        startDate: '2024-01-01',
        employmentType: 'FULL_TIME',
        companyId: 1,
      };
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockEmployee } as any);

      const result = await employeeService.getCurrentEmployee();
      expect(result).toEqual(mockEmployee);
      expect(apiClient.get).toHaveBeenCalledWith('/employees/me');
    });
  });

  describe('create', () => {
    it('creates a new employee', async () => {
      const createData = {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        position: 'Developer',
        startDate: '2024-01-01',
        employmentType: 'FULL_TIME' as const,
        companyId: 1,
      };
      const mockEmployee: Employee = {
        id: 1,
        ...createData,
      };
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockEmployee } as any);

      const result = await employeeService.create(createData);
      expect(result).toEqual(mockEmployee);
      expect(apiClient.post).toHaveBeenCalledWith('/employees', createData);
    });
  });

  describe('update', () => {
    it('updates an employee', async () => {
      const updateData = {
        firstName: 'Jane',
        lastName: 'Doe',
      };
      const mockEmployee: Employee = {
        id: 1,
        firstName: 'Jane',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        position: 'Developer',
        startDate: '2024-01-01',
        employmentType: 'FULL_TIME',
        companyId: 1,
      };
      vi.mocked(apiClient.put).mockResolvedValue({ data: mockEmployee } as any);

      const result = await employeeService.update(1, updateData);
      expect(result).toEqual(mockEmployee);
      expect(apiClient.put).toHaveBeenCalledWith('/employees/1', updateData);
    });
  });

  describe('delete', () => {
    it('deletes an employee', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({} as any);

      await employeeService.delete(1);
      expect(apiClient.delete).toHaveBeenCalledWith('/employees/1');
    });
  });

  describe('getByDepartment', () => {
    it('returns employees by department', async () => {
      const mockEmployees: Employee[] = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          position: 'Developer',
          startDate: '2024-01-01',
          employmentType: 'FULL_TIME',
          companyId: 1,
        },
      ];
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockEmployees } as any);

      const result = await employeeService.getByDepartment(1);
      expect(result).toEqual(mockEmployees);
      expect(apiClient.get).toHaveBeenCalledWith('/employees/department/1');
    });
  });

  describe('getSubordinates', () => {
    it('returns subordinates of a manager', async () => {
      const mockEmployees: Employee[] = [
        {
          id: 2,
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane.doe@example.com',
          position: 'Developer',
          startDate: '2024-01-01',
          employmentType: 'FULL_TIME',
          companyId: 1,
        },
      ];
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockEmployees } as any);

      const result = await employeeService.getSubordinates(1);
      expect(result).toEqual(mockEmployees);
      expect(apiClient.get).toHaveBeenCalledWith('/employees/manager/1/subordinates');
    });
  });

  describe('activate', () => {
    it('activates an employee', async () => {
      const mockEmployee: Employee = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        position: 'Developer',
        startDate: '2024-01-01',
        employmentType: 'FULL_TIME',
        companyId: 1,
      };
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockEmployee } as any);

      const result = await employeeService.activate(1);
      expect(result).toEqual(mockEmployee);
      expect(apiClient.post).toHaveBeenCalledWith('/employees/1/activate');
    });
  });

  describe('deactivate', () => {
    it('deactivates an employee', async () => {
      const mockEmployee: Employee = {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        position: 'Developer',
        startDate: '2024-01-01',
        employmentType: 'FULL_TIME',
        companyId: 1,
      };
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockEmployee } as any);

      const result = await employeeService.deactivate(1);
      expect(result).toEqual(mockEmployee);
      expect(apiClient.post).toHaveBeenCalledWith('/employees/1/deactivate');
    });
  });

  describe('exportToExcel', () => {
    it('exports employees to Excel', async () => {
      const mockBlob = new Blob([], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      vi.mocked(apiClient.get).mockResolvedValueOnce({ 
        data: mockBlob,
        headers: { 'content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
      } as any);

      const result = await employeeService.exportToExcel(1);
      expect(result).toBeInstanceOf(Blob);
      expect(apiClient.get).toHaveBeenCalledWith('/employees/export', {
        params: { companyId: 1, departmentId: undefined },
        responseType: 'blob',
      });
    });
  });

  describe('importFromExcel', () => {
    it('imports employees from Excel', async () => {
      const mockFile = new File(['test'], 'employees.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const mockEmployees: Employee[] = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          position: 'Developer',
          startDate: '2024-01-01',
          employmentType: 'FULL_TIME',
          companyId: 1,
        },
      ];
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockEmployees } as any);

      const result = await employeeService.importFromExcel(mockFile);
      expect(result).toEqual(mockEmployees);
      expect(apiClient.post).toHaveBeenCalledWith(
        '/employees/import',
        expect.any(FormData),
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
    });
  });

  describe('search', () => {
    it('searches employees', async () => {
      const mockEmployees: Employee[] = [
        {
          id: 1,
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          position: 'Developer',
          startDate: '2024-01-01',
          employmentType: 'FULL_TIME',
          companyId: 1,
        },
      ];
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockEmployees } as any);

      const result = await employeeService.search('John');
      expect(result).toEqual(mockEmployees);
      expect(apiClient.get).toHaveBeenCalledWith('/employees/search', {
        params: { query: 'John' },
      });
    });
  });
});

