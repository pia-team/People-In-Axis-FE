import { apiClient } from './api';
import { Project, ProjectCreateDTO, ProjectUpdateDTO, PaginatedResponse } from '@/types';

const ENDPOINT = '/projects';

export const projectService = {
  getAll: async (params?: { page?: number; size?: number; search?: string; companyId?: number }) => {
    const response = await apiClient.get<PaginatedResponse<Project>>(ENDPOINT, { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get<Project>(`${ENDPOINT}/${id}`);
    return response.data;
  },

  create: async (data: ProjectCreateDTO) => {
    const response = await apiClient.post<Project>(ENDPOINT, data);
    return response.data;
  },

  update: async (id: number, data: ProjectUpdateDTO) => {
    const response = await apiClient.put<Project>(`${ENDPOINT}/${id}`, data);
    return response.data;
  },

  delete: async (id: number) => {
    await apiClient.delete(`${ENDPOINT}/${id}`);
  },
};
