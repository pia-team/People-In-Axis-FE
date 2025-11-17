import { describe, it, expect, vi, beforeEach } from 'vitest';
import { timeSheetService } from '@/services/timesheetService';
import { apiClient } from '@/services/api';
import type { TimeSheet, TimeSheetRow, TimeSheetImportResult, PaginatedResponse } from '@/types';

vi.mock('@/services/api');
vi.mock('@/config/apiPaths', () => ({
  apiPath: (path: string) => `/api${path}`,
}));

describe('TimeSheetService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('returns paginated timesheets', async () => {
      const mockResponse: PaginatedResponse<TimeSheet> = {
        content: [
          {
            id: 1,
            employeeId: 1,
            period: '2024-01',
            status: 'DRAFT',
            totalHours: 40,
          },
        ],
        pageInfo: {
          page: 0,
          size: 10,
          totalElements: 1,
          totalPages: 1,
        },
      };
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse } as any);

      const result = await timeSheetService.getAll();
      expect(result.content).toHaveLength(1);
      expect(result.pageInfo.totalElements).toBe(1);
      expect(apiClient.get).toHaveBeenCalledWith('/timesheets', { params: undefined });
    });
  });

  describe('getById', () => {
    it('returns a single timesheet', async () => {
      const mockTimeSheet: TimeSheet = {
        id: 1,
        employeeId: 1,
        period: '2024-01',
        status: 'DRAFT',
        totalHours: 40,
      };
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockTimeSheet } as any);

      const result = await timeSheetService.getById(1);
      expect(result).toEqual(mockTimeSheet);
      expect(apiClient.get).toHaveBeenCalledWith('/timesheets/1');
    });
  });

  describe('getPending', () => {
    it('returns pending timesheets', async () => {
      const mockResponse: PaginatedResponse<TimeSheet> = {
        content: [],
        pageInfo: {
          page: 0,
          size: 10,
          totalElements: 0,
          totalPages: 0,
        },
      };
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse } as any);

      await timeSheetService.getPending();
      expect(apiClient.get).toHaveBeenCalledWith('/timesheets/pending', { params: undefined });
    });
  });

  describe('getManagerPending', () => {
    it('returns manager pending timesheets', async () => {
      const mockResponse: PaginatedResponse<TimeSheet> = {
        content: [],
        pageInfo: {
          page: 0,
          size: 10,
          totalElements: 0,
          totalPages: 0,
        },
      };
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse } as any);

      await timeSheetService.getManagerPending();
      expect(apiClient.get).toHaveBeenCalledWith('/timesheets/manager-pending', { params: undefined });
    });
  });

  describe('getManagerPendingCount', () => {
    it('returns manager pending count', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: 5 } as any);

      const result = await timeSheetService.getManagerPendingCount();
      expect(result).toBe(5);
      expect(apiClient.get).toHaveBeenCalledWith('/timesheets/manager-pending/count');
    });
  });

  describe('getAdminPending', () => {
    it('returns admin pending timesheets', async () => {
      const mockResponse: PaginatedResponse<TimeSheet> = {
        content: [],
        pageInfo: {
          page: 0,
          size: 10,
          totalElements: 0,
          totalPages: 0,
        },
      };
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse } as any);

      await timeSheetService.getAdminPending();
      expect(apiClient.get).toHaveBeenCalledWith('/timesheets/admin-pending', { params: undefined });
    });
  });

  describe('getAdminPendingCount', () => {
    it('returns admin pending count', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({ data: 3 } as any);

      const result = await timeSheetService.getAdminPendingCount();
      expect(result).toBe(3);
      expect(apiClient.get).toHaveBeenCalledWith('/timesheets/admin-pending/count');
    });
  });

  describe('getMy', () => {
    it('returns my timesheets', async () => {
      const mockResponse: PaginatedResponse<TimeSheet> = {
        content: [],
        pageInfo: {
          page: 0,
          size: 10,
          totalElements: 0,
          totalPages: 0,
        },
      };
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse } as any);

      await timeSheetService.getMy();
      expect(apiClient.get).toHaveBeenCalledWith('/timesheets/my', { params: undefined });
    });
  });

  describe('submit', () => {
    it('submits a timesheet', async () => {
      const mockTimeSheet: TimeSheet = {
        id: 1,
        employeeId: 1,
        period: '2024-01',
        status: 'SUBMITTED',
        totalHours: 40,
      };
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockTimeSheet } as any);

      const result = await timeSheetService.submit(1);
      expect(result).toEqual(mockTimeSheet);
      expect(apiClient.post).toHaveBeenCalledWith('/timesheets/1/submit');
    });
  });

  describe('approve', () => {
    it('approves a timesheet', async () => {
      const mockTimeSheet: TimeSheet = {
        id: 1,
        employeeId: 1,
        period: '2024-01',
        status: 'APPROVED',
        totalHours: 40,
      };
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockTimeSheet } as any);

      const result = await timeSheetService.approve(1, 'Approved');
      expect(result).toEqual(mockTimeSheet);
      expect(apiClient.post).toHaveBeenCalledWith('/timesheets/1/approve', undefined, {
        params: { comments: 'Approved' },
      });
    });
  });

  describe('reject', () => {
    it('rejects a timesheet', async () => {
      const mockTimeSheet: TimeSheet = {
        id: 1,
        employeeId: 1,
        period: '2024-01',
        status: 'REJECTED',
        totalHours: 40,
      };
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockTimeSheet } as any);

      const result = await timeSheetService.reject(1, 'Rejected');
      expect(result).toEqual(mockTimeSheet);
      expect(apiClient.post).toHaveBeenCalledWith('/timesheets/1/reject', undefined, {
        params: { reason: 'Rejected' },
      });
    });
  });

  describe('getRows', () => {
    it('returns timesheet rows', async () => {
      const mockResponse: PaginatedResponse<TimeSheetRow> = {
        content: [
          {
            id: 1,
            timesheetId: 1,
            date: '2024-01-01',
            hours: 8,
          },
        ],
        pageInfo: {
          page: 0,
          size: 10,
          totalElements: 1,
          totalPages: 1,
        },
      };
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse } as any);

      const result = await timeSheetService.getRows(1);
      expect(result.content).toHaveLength(1);
      expect(apiClient.get).toHaveBeenCalledWith('/timesheets/1/rows', { params: undefined });
    });
  });

  describe('createRow', () => {
    it('creates a timesheet row', async () => {
      const mockRow: TimeSheetRow = {
        id: 1,
        timesheetId: 1,
        date: '2024-01-01',
        hours: 8,
      };
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockRow } as any);

      const result = await timeSheetService.createRow(1, { date: '2024-01-01', hours: 8 });
      expect(result).toEqual(mockRow);
      expect(apiClient.post).toHaveBeenCalledWith('/timesheets/1/rows', { date: '2024-01-01', hours: 8 });
    });
  });

  describe('updateRow', () => {
    it('updates a timesheet row', async () => {
      const mockRow: TimeSheetRow = {
        id: 1,
        timesheetId: 1,
        date: '2024-01-01',
        hours: 8,
      };
      vi.mocked(apiClient.put).mockResolvedValue({ data: mockRow } as any);

      const result = await timeSheetService.updateRow(1, 1, { hours: 8 });
      expect(result).toEqual(mockRow);
      expect(apiClient.put).toHaveBeenCalledWith('/timesheets/1/rows/1', { hours: 8 });
    });
  });

  describe('deleteRow', () => {
    it('deletes a timesheet row', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({} as any);

      await timeSheetService.deleteRow(1, 1);
      expect(apiClient.delete).toHaveBeenCalledWith('/timesheets/1/rows/1');
    });
  });

  describe('exportExcel', () => {
    it('exports timesheets to Excel', async () => {
      const mockBlob = new Blob([], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      vi.mocked(apiClient.get).mockResolvedValueOnce({ 
        data: mockBlob,
        headers: { 'content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
      } as any);

      const result = await timeSheetService.exportExcel();
      expect(result).toBeInstanceOf(Blob);
      expect(apiClient.get).toHaveBeenCalledWith('/timesheets/export', {
        params: undefined,
        responseType: 'blob',
      });
    });
  });

  describe('importExcel', () => {
    it('imports timesheets from Excel', async () => {
      const mockFile = new File(['test'], 'timesheets.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const mockResult: TimeSheetImportResult = {
        success: true,
        imported: 5,
        errors: [],
      };
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockResult } as any);

      const result = await timeSheetService.importExcel(mockFile);
      expect(result).toEqual(mockResult);
      expect(apiClient.post).toHaveBeenCalledWith(
        '/timesheets/import',
        expect.any(FormData),
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
    });
  });
});


