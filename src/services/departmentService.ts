import { apiClient } from './api';
import { Department, DepartmentCreateDTO, DepartmentUpdateDTO, PaginatedResponse } from '@/types';

const ENDPOINT = '/departments';

export const departmentService = {
  getAll: async (params?: { page?: number; size?: number; search?: string; companyId?: number }) => {
    const response = await apiClient.get<PaginatedResponse<Department>>(ENDPOINT, { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get<Department>(`${ENDPOINT}/${id}`);
    return response.data;
  },

  getByCompany: async (companyId: number) => {
    const response = await apiClient.get<Department[]>(`${ENDPOINT}/company/${companyId}`);
    return response.data;
  },

  create: async (data: DepartmentCreateDTO) => {
    const response = await apiClient.post<Department>(ENDPOINT, data);
    return response.data;
  },

  update: async (id: number, data: DepartmentUpdateDTO) => {
    const response = await apiClient.put<Department>(`${ENDPOINT}/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await apiClient.delete(`${ENDPOINT}/${id}`);
  },
};
