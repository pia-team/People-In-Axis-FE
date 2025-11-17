import type { SpringPageResponse } from '@/types/api';
import { isSpringPageResponse } from '@/types/api';
import type { PagedResponse } from '@/types/cv-sharing';

/**
 * Normalize Spring Boot page response to our PagedResponse format
 */
export function normalizePageResponse<T>(
  data: SpringPageResponse<T> | T[] | unknown,
  filter?: { page?: number; size?: number }
): PagedResponse<T> {
  if (isSpringPageResponse<T>(data)) {
    return {
      content: data.content,
      pageInfo: {
        page: data.number ?? filter?.page ?? 0,
        size: data.size ?? filter?.size ?? 10,
        totalElements: data.totalElements ?? data.content.length,
        totalPages: data.totalPages ?? 1,
      },
    };
  }

  if (Array.isArray(data)) {
    return {
      content: data,
      pageInfo: {
        page: filter?.page ?? 0,
        size: filter?.size ?? 10,
        totalElements: data.length,
        totalPages: 1,
      },
    };
  }

  // Fallback for unexpected data format
  return {
    content: [],
    pageInfo: {
      page: filter?.page ?? 0,
      size: filter?.size ?? 10,
      totalElements: 0,
      totalPages: 1,
    },
  };
}

/**
 * Extract error message from API error
 */
export function extractErrorMessage(error: unknown): string {
  if (error && typeof error === 'object') {
    if ('message' in error && typeof error.message === 'string') {
      return error.message;
    }
    if ('response' in error) {
      const response = (error as { response?: { data?: { message?: string } } }).response;
      if (response?.data?.message) {
        return response.data.message;
      }
      if (response && 'status' in response && typeof response.status === 'number') {
        return `Request failed with status ${response.status}`;
      }
    }
  }
  return error instanceof Error ? error.message : 'An unknown error occurred';
}

/**
 * Check if error is a network error
 */
export function isNetworkError(error: unknown): boolean {
  if (error && typeof error === 'object') {
    if ('code' in error && error.code === 'ERR_NETWORK') {
      return true;
    }
    if ('request' in error && !('response' in error)) {
      return true;
    }
  }
  return false;
}

/**
 * Check if error is a client error (4xx)
 */
export function isClientError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { status?: number } }).response;
    const status = response?.status;
    return status !== undefined && status >= 400 && status < 500;
  }
  return false;
}

/**
 * Check if error is a server error (5xx)
 */
export function isServerError(error: unknown): boolean {
  if (error && typeof error === 'object' && 'response' in error) {
    const response = (error as { response?: { status?: number } }).response;
    const status = response?.status;
    return status !== undefined && status >= 500;
  }
  return false;
}

