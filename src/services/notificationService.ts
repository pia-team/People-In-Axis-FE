import { apiClient } from './api';
import { apiPath } from '@/config/apiPaths';
import type { Notification, PagedResponse } from '@/types/cv-sharing';
import type { SpringPageResponse } from '@/types/api';
import { isSpringPageResponse } from '@/types/api';

const ENDPOINT = apiPath('notifications');

export interface NotificationFilter {
  unread?: boolean;
  page?: number;
  size?: number;
}

export interface NotificationCount {
  total: number;
  unread: number;
}

class NotificationService {
  private baseUrl = ENDPOINT;

  /**
   * Get paginated list of notifications
   */
  async getNotifications(filter?: NotificationFilter): Promise<PagedResponse<Notification>> {
    const response = await apiClient.get<SpringPageResponse<Notification> | Notification[]>(this.baseUrl, {
      params: filter
    });
    const data = response.data;
    
    // Normalize Spring Page or already-normalized payload
    let content: Notification[];
    let pageInfo: PagedResponse<Notification>["pageInfo"];
    
    if (isSpringPageResponse<Notification>(data)) {
      content = data.content;
      pageInfo = {
        page: data.number ?? filter?.page ?? 0,
        size: data.size ?? filter?.size ?? 10,
        totalElements: data.totalElements ?? content.length,
        totalPages: data.totalPages ?? 1,
      };
    } else if (Array.isArray(data)) {
      content = data;
      pageInfo = {
        page: filter?.page ?? 0,
        size: filter?.size ?? 10,
        totalElements: content.length,
        totalPages: 1,
      };
    } else {
      content = [];
      pageInfo = {
        page: filter?.page ?? 0,
        size: filter?.size ?? 10,
        totalElements: 0,
        totalPages: 1,
      };
    }
    
    return { content, pageInfo };
  }

  /**
   * Get unread notifications count
   * Uses dedicated endpoint if available, otherwise falls back to paginated query
   */
  async getUnreadCount(): Promise<number> {
    try {
      // Try dedicated endpoint first
      try {
        const response = await apiClient.get<number>(`${this.baseUrl}/unread-count`);
        return response.data ?? 0;
      } catch {
        // Fallback to paginated query
        const response = await apiClient.get<SpringPageResponse<Notification> | Notification[]>(this.baseUrl, {
          params: { unread: true, page: 0, size: 1 }
        });
        
        const data = response.data;
        
        // If it's a Spring Page response, use totalElements
        if (isSpringPageResponse<Notification>(data)) {
          return data.totalElements ?? 0;
        }
        
        // If it's an array, count unread items
        if (Array.isArray(data)) {
          return data.filter(n => !n.isRead).length;
        }
        
        return 0;
      }
    } catch (error) {
      // If endpoint doesn't exist yet or returns an error, return 0
      // This allows the app to work even if the notification endpoint is not implemented
      if (import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.warn('Notification endpoint not available, returning 0:', error);
      }
      return 0;
    }
  }

  /**
   * Get notification by ID
   */
  async getNotificationById(id: string): Promise<Notification> {
    const response = await apiClient.get<Notification>(`${this.baseUrl}/${id}`);
    return response.data;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(id: string): Promise<void> {
    await apiClient.patch(`${this.baseUrl}/${id}/read`);
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<void> {
    await apiClient.patch(`${this.baseUrl}/read-all`);
  }

  /**
   * Delete notification
   */
  async deleteNotification(id: string): Promise<void> {
    await apiClient.delete(`${this.baseUrl}/${id}`);
  }
}

export const notificationService = new NotificationService();

