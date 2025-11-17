import { describe, it, expect, vi, beforeEach } from 'vitest';
import { expenseService } from '@/services/expenseService';
import { apiClient } from '@/services/api';
import type { Expense, PaginatedResponse } from '@/types';

vi.mock('@/services/api');
vi.mock('@/config/apiPaths', () => ({
  apiPath: (path: string) => `/api${path}`,
}));

describe('ExpenseService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getAll', () => {
    it('returns paginated expenses', async () => {
      const mockResponse: PaginatedResponse<Expense> = {
        content: [
          {
            id: 1,
            employeeId: 1,
            amount: 100,
            currency: 'USD',
            description: 'Test expense',
            category: 'TRAVEL',
            status: 'PENDING',
            date: '2024-01-01',
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

      const result = await expenseService.getAll();
      expect(result.content).toHaveLength(1);
      expect(result.pageInfo.totalElements).toBe(1);
      expect(apiClient.get).toHaveBeenCalledWith('/expenses', { params: undefined });
    });

    it('returns paginated expenses with filters', async () => {
      const mockResponse: PaginatedResponse<Expense> = {
        content: [],
        pageInfo: {
          page: 0,
          size: 10,
          totalElements: 0,
          totalPages: 0,
        },
      };
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse } as any);

      const params = { page: 0, size: 20 };
      await expenseService.getAll(params);
      expect(apiClient.get).toHaveBeenCalledWith('/expenses', { params });
    });
  });

  describe('getById', () => {
    it('returns a single expense', async () => {
      const mockExpense: Expense = {
        id: 1,
        employeeId: 1,
        amount: 100,
        currency: 'USD',
        description: 'Test expense',
        category: 'TRAVEL',
        status: 'PENDING',
        date: '2024-01-01',
      };
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockExpense } as any);

      const result = await expenseService.getById(1);
      expect(result).toEqual(mockExpense);
      expect(apiClient.get).toHaveBeenCalledWith('/expenses/1');
    });
  });

  describe('getPending', () => {
    it('returns pending expenses', async () => {
      const mockResponse: PaginatedResponse<Expense> = {
        content: [],
        pageInfo: {
          page: 0,
          size: 10,
          totalElements: 0,
          totalPages: 0,
        },
      };
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse } as any);

      await expenseService.getPending();
      expect(apiClient.get).toHaveBeenCalledWith('/expenses/pending', { params: undefined });
    });
  });

  describe('getMy', () => {
    it('returns my expenses', async () => {
      const mockResponse: PaginatedResponse<Expense> = {
        content: [],
        pageInfo: {
          page: 0,
          size: 10,
          totalElements: 0,
          totalPages: 0,
        },
      };
      vi.mocked(apiClient.get).mockResolvedValue({ data: mockResponse } as any);

      await expenseService.getMy();
      expect(apiClient.get).toHaveBeenCalledWith('/expenses/my', { params: undefined });
    });
  });

  describe('submit', () => {
    it('submits an expense', async () => {
      const mockExpense: Expense = {
        id: 1,
        employeeId: 1,
        amount: 100,
        currency: 'USD',
        description: 'Test expense',
        category: 'TRAVEL',
        status: 'SUBMITTED',
        date: '2024-01-01',
      };
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockExpense } as any);

      const result = await expenseService.submit(1);
      expect(result).toEqual(mockExpense);
      expect(apiClient.post).toHaveBeenCalledWith('/expenses/1/submit');
    });
  });

  describe('approve', () => {
    it('approves an expense', async () => {
      const mockExpense: Expense = {
        id: 1,
        employeeId: 1,
        amount: 100,
        currency: 'USD',
        description: 'Test expense',
        category: 'TRAVEL',
        status: 'APPROVED',
        date: '2024-01-01',
      };
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockExpense } as any);

      const result = await expenseService.approve(1, 'Approved');
      expect(result).toEqual(mockExpense);
      expect(apiClient.post).toHaveBeenCalledWith('/expenses/1/approve', undefined, {
        params: { comments: 'Approved' },
      });
    });
  });

  describe('reject', () => {
    it('rejects an expense', async () => {
      const mockExpense: Expense = {
        id: 1,
        employeeId: 1,
        amount: 100,
        currency: 'USD',
        description: 'Test expense',
        category: 'TRAVEL',
        status: 'REJECTED',
        date: '2024-01-01',
      };
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockExpense } as any);

      const result = await expenseService.reject(1, 'Rejected');
      expect(result).toEqual(mockExpense);
      expect(apiClient.post).toHaveBeenCalledWith('/expenses/1/reject', undefined, {
        params: { reason: 'Rejected' },
      });
    });
  });

  describe('reimburse', () => {
    it('reimburses an expense', async () => {
      const mockExpense: Expense = {
        id: 1,
        employeeId: 1,
        amount: 100,
        currency: 'USD',
        description: 'Test expense',
        category: 'TRAVEL',
        status: 'REIMBURSED',
        date: '2024-01-01',
      };
      vi.mocked(apiClient.post).mockResolvedValue({ data: mockExpense } as any);

      const result = await expenseService.reimburse(1, 'REF123');
      expect(result).toEqual(mockExpense);
      expect(apiClient.post).toHaveBeenCalledWith('/expenses/1/reimburse', undefined, {
        params: { reference: 'REF123' },
      });
    });
  });

  describe('exportExcel', () => {
    it('exports expenses to Excel', async () => {
      const mockBlob = new Blob([], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      vi.mocked(apiClient.get).mockResolvedValueOnce({ 
        data: mockBlob,
        headers: { 'content-type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }
      } as any);

      const result = await expenseService.exportExcel();
      expect(result).toBeInstanceOf(Blob);
      expect(apiClient.get).toHaveBeenCalledWith('/expenses/export', {
        params: undefined,
        responseType: 'blob',
      });
    });
  });

  describe('importExcel', () => {
    it('imports expenses from Excel', async () => {
      const mockFile = new File(['test'], 'expenses.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      vi.mocked(apiClient.post).mockResolvedValue({ data: 5 } as any);

      const result = await expenseService.importExcel(mockFile);
      expect(result).toBe(5);
      expect(apiClient.post).toHaveBeenCalledWith(
        '/expenses/import',
        expect.any(FormData),
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );
    });
  });
});


