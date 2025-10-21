import { apiClient } from './api';

export interface DashboardMetrics {
  totalEmployees: number;
  activeProjects: number;
  pendingTimesheetsManager: number;
  pendingTimesheetsAdmin: number;
  pendingExpenses: number;
  teamLeadAssignedRows: number;
}

export const dashboardService = {
  getMetrics: async (): Promise<DashboardMetrics> => {
    const res = await apiClient.get<DashboardMetrics>('/dashboard/metrics');
    return res.data;
  },
};
