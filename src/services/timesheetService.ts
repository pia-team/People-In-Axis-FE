import { apiClient } from './api';
import { PaginatedResponse, TimeSheet, TimeSheetRow } from '@/types';

const ENDPOINT = '/timesheets';

export const timeSheetService = {
  getAll: async (params?: { page?: number; size?: number }) => {
    const response = await apiClient.get<PaginatedResponse<TimeSheet>>(ENDPOINT, { params });
    return response.data;
  },

  getById: async (id: number) => {
    const response = await apiClient.get<TimeSheet>(`${ENDPOINT}/${id}`);
    return response.data;
  },

  getPending: async (params?: { page?: number; size?: number }) => {
    const response = await apiClient.get<PaginatedResponse<TimeSheet>>(`${ENDPOINT}/pending`, { params });
    return response.data;
  },

  getAdminPending: async (params?: { page?: number; size?: number }) => {
    const response = await apiClient.get<PaginatedResponse<TimeSheet>>(`${ENDPOINT}/admin-pending`, { params });
    return response.data;
  },

  getMy: async (params?: { page?: number; size?: number }) => {
    const response = await apiClient.get<PaginatedResponse<TimeSheet>>(`${ENDPOINT}/my`, { params });
    return response.data;
  },

  submit: async (id: number) => {
    const response = await apiClient.post<TimeSheet>(`${ENDPOINT}/${id}/submit`);
    return response.data;
  },

  cancel: async (id: number, reason: string) => {
    const response = await apiClient.post<TimeSheet>(`${ENDPOINT}/${id}/cancel`, undefined, { params: { reason } });
    return response.data;
  },

  approve: async (id: number, comments?: string) => {
    const response = await apiClient.post<TimeSheet>(`${ENDPOINT}/${id}/approve`, undefined, { params: { comments } });
    return response.data;
  },

  reject: async (id: number, reason: string) => {
    const response = await apiClient.post<TimeSheet>(`${ENDPOINT}/${id}/reject`, undefined, { params: { reason } });
    return response.data;
  },

  // Row APIs
  getHistory: async (id: number) => {
    const response = await apiClient.get<
      { type: 'BASE' | 'ROW'; createdAt: string; oldStatus?: string; newStatus?: string; reason?: string; actorEmployeeId?: number; actorEmployeeName?: string; rowId?: number }[]
    >(`${ENDPOINT}/${id}/history`);
    return response.data;
  },

  getRows: async (id: number, params?: { page?: number; size?: number }) => {
    const response = await apiClient.get<PaginatedResponse<TimeSheetRow>>(`${ENDPOINT}/${id}/rows`, { params });
    return response.data;
  },

  createRow: async (id: number, payload: Partial<TimeSheetRow>) => {
    const response = await apiClient.post<TimeSheetRow>(`${ENDPOINT}/${id}/rows`, payload);
    return response.data;
  },

  updateRow: async (id: number, rowId: number, payload: Partial<TimeSheetRow>) => {
    const response = await apiClient.put<TimeSheetRow>(`${ENDPOINT}/${id}/rows/${rowId}`, payload);
    return response.data;
  },

  deleteRow: async (id: number, rowId: number) => {
    await apiClient.delete(`${ENDPOINT}/${id}/rows/${rowId}`);
  },

  assignRow: async (id: number, rowId: number, assigneeEmployeeId: number) => {
    const response = await apiClient.post<TimeSheetRow>(`${ENDPOINT}/${id}/rows/${rowId}/assign`, undefined, { params: { assigneeEmployeeId } });
    return response.data;
  },

  approveRow: async (id: number, rowId: number, comments?: string) => {
    const response = await apiClient.post<TimeSheetRow>(`${ENDPOINT}/${id}/rows/${rowId}/approve`, undefined, { params: { comments } });
    return response.data;
  },

  rejectRow: async (id: number, rowId: number, reason: string) => {
    const response = await apiClient.post<TimeSheetRow>(`${ENDPOINT}/${id}/rows/${rowId}/reject`, undefined, { params: { reason } });
    return response.data;
  },

  // Admin finalize
  adminApprove: async (id: number) => {
    const response = await apiClient.post<TimeSheet>(`${ENDPOINT}/${id}/admin-approve`);
    return response.data;
  },

  adminReject: async (id: number, reason: string) => {
    const response = await apiClient.post<TimeSheet>(`${ENDPOINT}/${id}/admin-reject`, undefined, { params: { reason } });
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
