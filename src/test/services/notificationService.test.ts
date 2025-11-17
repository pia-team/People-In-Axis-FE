import { describe, it, expect, vi, beforeEach } from 'vitest';
import { notificationService } from '@/services/notificationService';
import { apiClient } from '@/services/api';
import type { SpringPageResponse } from '@/types/api';
import type { Notification } from '@/types/cv-sharing';

vi.mock('@/services/api');
vi.mock('@/config/apiPaths', () => ({
  apiPath: (path: string) => `/api/${path}`,
}));

describe('NotificationService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getNotifications', () => {
    it('returns paginated notifications from Spring Page response', async () => {
      const mockResponse: SpringPageResponse<Notification> = {
        content: [
          {
            id: '1',
            userId: 'user1',
            type: 'INFO',
            subject: 'Test',
            content: 'Test content',
            isRead: false,
            createdAt: '2024-01-01',
          },
        ],
        totalElements: 1,
        totalPages: 1,
        size: 10,
        number: 0,
        first: true,
        last: true,
        numberOfElements: 1,
        empty: false,
      };

      vi.mocked(apiClient.get).mockResolvedValue({
        data: mockResponse,
      } as any);

      const result = await notificationService.getNotifications();

      expect(result.content).toHaveLength(1);
      expect(result.pageInfo.totalElements).toBe(1);
      expect(result.pageInfo.page).toBe(0);
      expect(result.pageInfo.size).toBe(10);
    });

    it('returns paginated notifications from array response', async () => {
      const mockNotifications: Notification[] = [
        {
          id: '1',
          userId: 'user1',
          type: 'INFO',
          subject: 'Test',
          content: 'Test content',
          isRead: false,
          createdAt: '2024-01-01',
        },
      ];

      vi.mocked(apiClient.get).mockResolvedValue({
        data: mockNotifications,
      } as any);

      const result = await notificationService.getNotifications();

      expect(result.content).toHaveLength(1);
      expect(result.pageInfo.totalElements).toBe(1);
    });

    it('uses filter parameters', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: {
          content: [],
          totalElements: 0,
          totalPages: 0,
          size: 20,
          number: 1,
          first: false,
          last: true,
          numberOfElements: 0,
          empty: true,
        },
      } as any);

      await notificationService.getNotifications({ page: 1, size: 20, unread: true });

      expect(apiClient.get).toHaveBeenCalledWith('/api/notifications', {
        params: { page: 1, size: 20, unread: true },
      });
    });
  });

  describe('getUnreadCount', () => {
    it('returns unread count from dedicated endpoint', async () => {
      vi.mocked(apiClient.get).mockResolvedValue({
        data: 5,
      } as any);

      const count = await notificationService.getUnreadCount();

      expect(count).toBe(5);
    });

    it('falls back to paginated query when dedicated endpoint fails', async () => {
      vi.mocked(apiClient.get)
        .mockRejectedValueOnce(new Error('Not found'))
        .mockResolvedValueOnce({
          data: {
            content: [],
            totalElements: 3,
            totalPages: 1,
            size: 1,
            number: 0,
            first: true,
            last: true,
            numberOfElements: 0,
            empty: true,
          },
        } as any);

      const count = await notificationService.getUnreadCount();

      expect(count).toBe(3);
    });

    it('returns 0 when endpoint is not available', async () => {
      vi.mocked(apiClient.get).mockRejectedValue(new Error('Not found'));

      const count = await notificationService.getUnreadCount();

      expect(count).toBe(0);
    });

    it('counts unread items from array response', async () => {
      vi.mocked(apiClient.get)
        .mockRejectedValueOnce(new Error('Not found'))
        .mockResolvedValueOnce({
          data: [
            { id: '1', userId: 'user1', type: 'INFO', subject: 'Test', content: 'Test', isRead: false, createdAt: '2024-01-01' },
            { id: '2', userId: 'user1', type: 'INFO', subject: 'Test', content: 'Test', isRead: true, createdAt: '2024-01-01' },
            { id: '3', userId: 'user1', type: 'INFO', subject: 'Test', content: 'Test', isRead: false, createdAt: '2024-01-01' },
          ],
        } as any);

      const count = await notificationService.getUnreadCount();

      expect(count).toBe(2);
    });
  });

  describe('getNotificationById', () => {
    it('returns notification by ID', async () => {
      const mockNotification: Notification = {
        id: '1',
        userId: 'user1',
        type: 'INFO',
        subject: 'Test',
        content: 'Test content',
        isRead: false,
        createdAt: '2024-01-01',
      };

      vi.mocked(apiClient.get).mockResolvedValue({
        data: mockNotification,
      } as any);

      const result = await notificationService.getNotificationById('1');

      expect(result).toEqual(mockNotification);
      expect(apiClient.get).toHaveBeenCalledWith('/api/notifications/1');
    });
  });

  describe('markAsRead', () => {
    it('marks notification as read', async () => {
      vi.mocked(apiClient.patch).mockResolvedValue({} as any);

      await notificationService.markAsRead('1');

      expect(apiClient.patch).toHaveBeenCalledWith('/api/notifications/1/read');
    });
  });

  describe('markAllAsRead', () => {
    it('marks all notifications as read', async () => {
      vi.mocked(apiClient.patch).mockResolvedValue({} as any);

      await notificationService.markAllAsRead();

      expect(apiClient.patch).toHaveBeenCalledWith('/api/notifications/read-all');
    });
  });

  describe('deleteNotification', () => {
    it('deletes notification', async () => {
      vi.mocked(apiClient.delete).mockResolvedValue({} as any);

      await notificationService.deleteNotification('1');

      expect(apiClient.delete).toHaveBeenCalledWith('/api/notifications/1');
    });
  });
});
