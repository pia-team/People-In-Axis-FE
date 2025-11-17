import { describe, it, expect, vi, beforeEach } from 'vitest';
import { logService } from '@/services/logService';
import { apiClient } from '@/services/api';
import type { AuditLog } from '@/types/cv-sharing';

vi.mock('@/services/api');

describe('logService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getLogs fetches logs without filters', async () => {
    const mockLogs = {
      content: [
        { id: '1', entityType: 'Application', entityId: 'app1', action: 'CREATE', userId: 'user1', createdAt: '2024-01-01' },
        { id: '2', entityType: 'Position', entityId: 'pos1', action: 'UPDATE', userId: 'user2', createdAt: '2024-01-02' },
      ] as AuditLog[],
      pageInfo: { page: 0, size: 10, totalElements: 2, totalPages: 1 },
    };
    vi.mocked(apiClient.get).mockResolvedValue({ data: mockLogs } as any);

    const result = await logService.getLogs();
    expect(result).toEqual(mockLogs);
    expect(vi.mocked(apiClient.get)).toHaveBeenCalledWith(
      expect.stringContaining('logs'),
      { params: undefined }
    );
  });

  it('getLogs fetches logs with entityType filter', async () => {
    const mockLogs = {
      content: [
        { id: '1', entityType: 'Application', entityId: 'app1', action: 'CREATE', userId: 'user1', createdAt: '2024-01-01' },
      ] as AuditLog[],
      pageInfo: { page: 0, size: 10, totalElements: 1, totalPages: 1 },
    };
    vi.mocked(apiClient.get).mockResolvedValue({ data: mockLogs } as any);

    const result = await logService.getLogs({ entityType: 'Application' });
    expect(result).toEqual(mockLogs);
    expect(vi.mocked(apiClient.get)).toHaveBeenCalledWith(
      expect.stringContaining('logs'),
      { params: { entityType: 'Application' } }
    );
  });

  it('getLogs fetches logs with entityId filter', async () => {
    const mockLogs = {
      content: [
        { id: '1', entityType: 'Application', entityId: 'app1', action: 'CREATE', userId: 'user1', createdAt: '2024-01-01' },
      ] as AuditLog[],
      pageInfo: { page: 0, size: 10, totalElements: 1, totalPages: 1 },
    };
    vi.mocked(apiClient.get).mockResolvedValue({ data: mockLogs } as any);

    const result = await logService.getLogs({ entityId: 'app1' });
    expect(result).toEqual(mockLogs);
    expect(vi.mocked(apiClient.get)).toHaveBeenCalledWith(
      expect.stringContaining('logs'),
      { params: { entityId: 'app1' } }
    );
  });

  it('getLogs fetches logs with action filter', async () => {
    const mockLogs = {
      content: [
        { id: '1', entityType: 'Application', entityId: 'app1', action: 'CREATE', userId: 'user1', createdAt: '2024-01-01' },
      ] as AuditLog[],
      pageInfo: { page: 0, size: 10, totalElements: 1, totalPages: 1 },
    };
    vi.mocked(apiClient.get).mockResolvedValue({ data: mockLogs } as any);

    const result = await logService.getLogs({ action: 'CREATE' });
    expect(result).toEqual(mockLogs);
    expect(vi.mocked(apiClient.get)).toHaveBeenCalledWith(
      expect.stringContaining('logs'),
      { params: { action: 'CREATE' } }
    );
  });

  it('getLogs fetches logs with userId filter', async () => {
    const mockLogs = {
      content: [
        { id: '1', entityType: 'Application', entityId: 'app1', action: 'CREATE', userId: 'user1', createdAt: '2024-01-01' },
      ] as AuditLog[],
      pageInfo: { page: 0, size: 10, totalElements: 1, totalPages: 1 },
    };
    vi.mocked(apiClient.get).mockResolvedValue({ data: mockLogs } as any);

    const result = await logService.getLogs({ userId: 'user1' });
    expect(result).toEqual(mockLogs);
    expect(vi.mocked(apiClient.get)).toHaveBeenCalledWith(
      expect.stringContaining('logs'),
      { params: { userId: 'user1' } }
    );
  });

  it('getLogs fetches logs with pagination', async () => {
    const mockLogs = {
      content: [] as AuditLog[],
      pageInfo: { page: 1, size: 20, totalElements: 0, totalPages: 0 },
    };
    vi.mocked(apiClient.get).mockResolvedValue({ data: mockLogs } as any);

    const result = await logService.getLogs({ page: 1, size: 20 });
    expect(result).toEqual(mockLogs);
    expect(vi.mocked(apiClient.get)).toHaveBeenCalledWith(
      expect.stringContaining('logs'),
      { params: { page: 1, size: 20 } }
    );
  });

  it('getLogs fetches logs with all filters', async () => {
    const mockLogs = {
      content: [
        { id: '1', entityType: 'Application', entityId: 'app1', action: 'CREATE', userId: 'user1', createdAt: '2024-01-01' },
      ] as AuditLog[],
      pageInfo: { page: 0, size: 10, totalElements: 1, totalPages: 1 },
    };
    vi.mocked(apiClient.get).mockResolvedValue({ data: mockLogs } as any);

    const result = await logService.getLogs({
      entityType: 'Application',
      entityId: 'app1',
      action: 'CREATE',
      userId: 'user1',
      page: 0,
      size: 10,
    });
    expect(result).toEqual(mockLogs);
    expect(vi.mocked(apiClient.get)).toHaveBeenCalledWith(
      expect.stringContaining('logs'),
      {
        params: {
          entityType: 'Application',
          entityId: 'app1',
          action: 'CREATE',
          userId: 'user1',
          page: 0,
          size: 10,
        },
      }
    );
  });
});

