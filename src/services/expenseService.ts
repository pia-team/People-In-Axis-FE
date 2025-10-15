import { apiClient } from './api';
import { PaginatedResponse, Expense } from '@/types';

const ENDPOINT = '/expenses';

export const expenseService = {
  getAll: async (params?: { page?: number; size?: number }) => {
    const response = await apiClient.get<PaginatedResponse<Expense>>(ENDPOINT, { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get<Expense>(`${ENDPOINT}/${id}`);
    return response.data;
  },

  getPending: async (params?: { page?: number; size?: number }) => {
    const response = await apiClient.get<PaginatedResponse<Expense>>(`${ENDPOINT}/pending`, { params });
    return response.data;
  },

  getMy: async (params?: { page?: number; size?: number }) => {
    const response = await apiClient.get<PaginatedResponse<Expense>>(`${ENDPOINT}/my`, { params });
    return response.data;
  },

  submit: async (id: number) => {
    const response = await apiClient.post<Expense>(`${ENDPOINT}/${id}/submit`);
    return response.data;
  },

  approve: async (id: number, comments?: string) => {
    const response = await apiClient.post<Expense>(`${ENDPOINT}/${id}/approve`, undefined, { params: { comments } });
    return response.data;
  },

  reject: async (id: number, reason: string) => {
    const response = await apiClient.post<Expense>(`${ENDPOINT}/${id}/reject`, undefined, { params: { reason } });
    return response.data;
  },

  reimburse: async (id: number, reference?: string) => {
    const response = await apiClient.post<Expense>(`${ENDPOINT}/${id}/reimburse`, undefined, { params: { reference } });
    return response.data;
  },

  exportExcel: async (params?: { page?: number; size?: number }) => {
    const response = await apiClient.get<Blob>(`${ENDPOINT}/export`, {
      params,
      responseType: 'blob' as any,
    });
    return response.data;
  },

  importExcel: async (file: File) => {
    const form = new FormData();
    form.append('file', file);
    const response = await apiClient.post<number>(`${ENDPOINT}/import`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
