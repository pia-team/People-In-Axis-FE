import { apiClient } from './api';
import { AuditLog } from '@/types/cv-sharing';
import { apiPath } from '@/config/apiPaths';

export interface LogFilter {
  entityType?: string;
  entityId?: string;
  action?: string;
  userId?: string;
  page?: number;
  size?: number;
}

export const logService = {
  async getLogs(params?: LogFilter) {
    const res = await apiClient.get<{ content: AuditLog[]; pageInfo?: { page: number; size: number; totalElements: number; totalPages: number } }>(
      apiPath('logs'),
      { params }
    );
    return res.data;
  },
};
