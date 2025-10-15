import { apiClient } from './api';
import { Company, CompanyCreateDTO, CompanyUpdateDTO, PaginatedResponse } from '@/types';

const ENDPOINT = '/companies';

export const companyService = {
  getAll: async (params?: { page?: number; size?: number; search?: string }) => {
    const response = await apiClient.get<PaginatedResponse<Company>>(ENDPOINT, { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get<Company>(`${ENDPOINT}/${id}`);
    return response.data;
  },

  getParents: async () => {
    const response = await apiClient.get<Company[]>(`${ENDPOINT}/parents`);
    return response.data;
  },

  getSubsidiaries: async (id: number) => {
    const response = await apiClient.get<Company[]>(`${ENDPOINT}/${id}/subsidiaries`);
    return response.data;
  },

  create: async (data: CompanyCreateDTO) => {
    const response = await apiClient.post<Company>(ENDPOINT, data);
    return response.data;
  },

  update: async (id: number, data: CompanyUpdateDTO) => {
    const response = await apiClient.put<Company>(`${ENDPOINT}/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await apiClient.delete(`${ENDPOINT}/${id}`);
  },
};
