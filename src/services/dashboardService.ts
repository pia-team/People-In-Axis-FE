import { apiClient } from './api';

export interface DashboardMetrics {
  totalEmployees?: number;
  activeProjects?: number;
  pendingTimesheetsManager?: number;
  pendingTimesheetsAdmin?: number;
  pendingExpenses?: number;
  teamLeadAssignedRows?: number;

  timesheetBaseStatusCounts?: Record<string, number>;
  expenseStatusCounts?: Record<string, number>;

  companyId?: number;
  companyName?: string;
  companyTotalEmployees?: number;
  companyActiveProjects?: number;
  companyPendingTimesheets?: number;
  companyPendingExpenses?: number;
  companyTimesheetBaseStatusCounts?: Record<string, number>;
  companyExpenseStatusCounts?: Record<string, number>;

  recentTimesheets?: Array<{
    id?: number;
    employeeName?: string;
    projectName?: string;
    baseStatus?: string;
    createdAt?: string;
  }>;
  recentExpenses?: Array<{
    id?: number;
    employeeName?: string;
    amount?: number;
    currency?: string;
    status?: string;
    createdAt?: string;
  }>;
}

export const dashboardService = {
  getMetrics: async (): Promise<DashboardMetrics> => {
    const res = await apiClient.get<DashboardMetrics>('/dashboard/metrics');
    return res.data;
  },
};
