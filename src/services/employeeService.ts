import { apiClient } from './api';
import { Employee, EmployeeCreateDTO, EmployeeUpdateDTO, PaginatedResponse } from '@/types';

const ENDPOINT = '/employees';

export const employeeService = {
  // Get all employees with pagination and filters
  getAll: async (params?: {
    page?: number;
    size?: number;
    search?: string;
    companyId?: number;
    departmentId?: number;
    status?: string;
  }) => {
    const response = await apiClient.get<PaginatedResponse<Employee>>(ENDPOINT, { params });
    return response.data;
  },

  // Get employee by ID
  getById: async (id: number) => {
    const response = await apiClient.get<Employee>(`${ENDPOINT}/${id}`);
    return response.data;
  },

  // Get current employee (authenticated user)
  getCurrentEmployee: async () => {
    const response = await apiClient.get<Employee>(`${ENDPOINT}/me`);
    return response.data;
  },

  // Create new employee
  create: async (data: EmployeeCreateDTO) => {
    const response = await apiClient.post<Employee>(ENDPOINT, data);
    return response.data;
  },

  // Update employee
  update: async (id: number, data: EmployeeUpdateDTO) => {
    const response = await apiClient.put<Employee>(`${ENDPOINT}/${id}`, data);
    return response.data;
  },

  // Delete employee
  delete: async (id: number) => {
    await apiClient.delete(`${ENDPOINT}/${id}`);
  },

  // Get employees by department
  getByDepartment: async (departmentId: number) => {
    const response = await apiClient.get<Employee[]>(`${ENDPOINT}/department/${departmentId}`);
    return response.data;
  },

  // Get subordinates of a manager
  getSubordinates: async (managerId: number) => {
    const response = await apiClient.get<Employee[]>(`${ENDPOINT}/manager/${managerId}/subordinates`);
    return response.data;
  },

  // Activate employee
  activate: async (id: number) => {
    const response = await apiClient.post<Employee>(`${ENDPOINT}/${id}/activate`);
    return response.data;
  },

  // Deactivate employee
  deactivate: async (id: number) => {
    const response = await apiClient.post<Employee>(`${ENDPOINT}/${id}/deactivate`);
    return response.data;
  },

  // Export employees to Excel
  exportToExcel: async (companyId?: number, departmentId?: number) => {
    const response = await apiClient.get(`${ENDPOINT}/export`, {
      params: { companyId, departmentId },
      responseType: 'blob',
    });
    return response.data;
  },

  // Import employees from Excel
  importFromExcel: async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post<Employee[]>(`${ENDPOINT}/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Search employees
  search: async (query: string) => {
    const response = await apiClient.get<Employee[]>(`${ENDPOINT}/search`, {
      params: { query },
    });
    return response.data;
  },
};
