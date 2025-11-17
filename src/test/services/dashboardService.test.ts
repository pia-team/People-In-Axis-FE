import { describe, it, expect, vi, beforeEach } from 'vitest';
import { dashboardService } from '@/services/dashboardService';
import { apiClient } from '@/services/api';
import type { DashboardMetrics } from '@/services/dashboardService';

vi.mock('@/services/api');

describe('dashboardService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getMetrics fetches dashboard metrics', async () => {
    const mockMetrics: DashboardMetrics = {
      totalEmployees: 100,
      activeProjects: 10,
      pendingTimesheetsManager: 5,
      pendingTimesheetsAdmin: 3,
      pendingExpenses: 2,
      teamLeadAssignedRows: 1,
      totalPositions: 20,
      totalApplications: 50,
      totalPoolCVs: 30,
      activeMeetings: 5,
      timesheetBaseStatusCounts: { PENDING: 5, APPROVED: 10 },
      expenseStatusCounts: { PENDING: 2, APPROVED: 8 },
    };
    vi.mocked(apiClient.get).mockResolvedValue({ data: mockMetrics } as any);

    const result = await dashboardService.getMetrics();
    expect(result).toEqual(mockMetrics);
    expect(vi.mocked(apiClient.get)).toHaveBeenCalledWith('/dashboard/metrics');
  });

  it('getMetrics returns empty metrics when API returns empty object', async () => {
    const mockMetrics: DashboardMetrics = {};
    vi.mocked(apiClient.get).mockResolvedValue({ data: mockMetrics } as any);

    const result = await dashboardService.getMetrics();
    expect(result).toEqual(mockMetrics);
    expect(vi.mocked(apiClient.get)).toHaveBeenCalledWith('/dashboard/metrics');
  });

  it('getMetrics handles company metrics', async () => {
    const mockMetrics: DashboardMetrics = {
      companyId: 1,
      companyName: 'Test Company',
      companyTotalEmployees: 50,
      companyActiveProjects: 5,
      companyPendingTimesheets: 3,
      companyPendingExpenses: 2,
      companyTimesheetBaseStatusCounts: { PENDING: 3 },
      companyExpenseStatusCounts: { PENDING: 2 },
    };
    vi.mocked(apiClient.get).mockResolvedValue({ data: mockMetrics } as any);

    const result = await dashboardService.getMetrics();
    expect(result).toEqual(mockMetrics);
    expect(result.companyId).toBe(1);
    expect(result.companyName).toBe('Test Company');
  });

  it('getMetrics handles recent timesheets and expenses', async () => {
    const mockMetrics: DashboardMetrics = {
      recentTimesheets: [
        { id: 1, employeeName: 'John Doe', projectName: 'Project 1', baseStatus: 'PENDING', createdAt: '2024-01-01' },
        { id: 2, employeeName: 'Jane Smith', projectName: 'Project 2', baseStatus: 'APPROVED', createdAt: '2024-01-02' },
      ],
      recentExpenses: [
        { id: 1, employeeName: 'John Doe', amount: 100, currency: 'USD', status: 'PENDING', createdAt: '2024-01-01' },
        { id: 2, employeeName: 'Jane Smith', amount: 200, currency: 'USD', status: 'APPROVED', createdAt: '2024-01-02' },
      ],
    };
    vi.mocked(apiClient.get).mockResolvedValue({ data: mockMetrics } as any);

    const result = await dashboardService.getMetrics();
    expect(result.recentTimesheets).toHaveLength(2);
    expect(result.recentExpenses).toHaveLength(2);
    expect(result.recentTimesheets?.[0].employeeName).toBe('John Doe');
    expect(result.recentExpenses?.[0].amount).toBe(100);
  });
});

