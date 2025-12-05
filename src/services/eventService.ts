import { apiClient } from './api';
import { apiPath } from '@/config/apiPaths';

export interface EventEntry {
  timestamp: string;
  dateTime: string;
  message: string;
}

export interface EventsResponse {
  count: number;
  maxSize: number;
  events: EventEntry[];
}

export interface EventCountResponse {
  count: number;
  maxSize: number;
}

/**
 * Service for managing system events (error logs).
 */
export const eventService = {
  /**
   * Get all system events (newest first).
   */
  getEvents: async (): Promise<EventsResponse> => {
    const response = await apiClient.get<EventsResponse>(apiPath('/system-events'));
    return response.data;
  },

  /**
   * Get event count only.
   */
  getEventCount: async (): Promise<EventCountResponse> => {
    const response = await apiClient.get<EventCountResponse>(apiPath('/system-events/count'));
    return response.data;
  },

  /**
   * Clear all events.
   */
  clearEvents: async (): Promise<{ message: string }> => {
    const response = await apiClient.delete<{ message: string }>(apiPath('/system-events'));
    return response.data;
  },

  /**
   * Add a test event (for testing purposes).
   */
  addTestEvent: async (message?: string): Promise<{ message: string }> => {
    const params = message ? `?message=${encodeURIComponent(message)}` : '';
    const response = await apiClient.post<{ message: string }>(apiPath(`/system-events/test${params}`));
    return response.data;
  },
};

export default eventService;

