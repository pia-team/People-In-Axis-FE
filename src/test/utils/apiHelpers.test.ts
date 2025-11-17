import { describe, it, expect } from 'vitest';
import {
  normalizePageResponse,
  extractErrorMessage,
  isNetworkError,
  isClientError,
  isServerError,
} from '@/utils/apiHelpers';
import type { SpringPageResponse } from '@/types/api';

describe('apiHelpers', () => {
  describe('normalizePageResponse', () => {
    it('normalizes Spring Page response', () => {
      const springPage: SpringPageResponse<{ id: string; name: string }> = {
        content: [{ id: '1', name: 'Test' }],
        totalElements: 1,
        totalPages: 1,
        size: 10,
        number: 0,
        first: true,
        last: true,
        numberOfElements: 1,
        empty: false,
      };

      const result = normalizePageResponse(springPage);
      expect(result.content).toEqual([{ id: '1', name: 'Test' }]);
      expect(result.pageInfo.page).toBe(0);
      expect(result.pageInfo.size).toBe(10);
      expect(result.pageInfo.totalElements).toBe(1);
      expect(result.pageInfo.totalPages).toBe(1);
    });

    it('normalizes array response', () => {
      const array = [{ id: '1', name: 'Test' }, { id: '2', name: 'Test2' }];
      const result = normalizePageResponse(array);
      expect(result.content).toEqual(array);
      expect(result.pageInfo.page).toBe(0);
      expect(result.pageInfo.size).toBe(10);
      expect(result.pageInfo.totalElements).toBe(2);
      expect(result.pageInfo.totalPages).toBe(1);
    });

    it('uses filter parameters when provided', () => {
      const array = [{ id: '1' }];
      const result = normalizePageResponse(array, { page: 2, size: 20 });
      expect(result.pageInfo.page).toBe(2);
      expect(result.pageInfo.size).toBe(20);
    });

    it('handles unexpected data format', () => {
      const result = normalizePageResponse(null);
      expect(result.content).toEqual([]);
      expect(result.pageInfo.totalElements).toBe(0);
    });

    it('handles Spring Page response with missing fields', () => {
      const springPage: Partial<SpringPageResponse<{ id: string }>> = {
        content: [{ id: '1' }],
        number: undefined,
        size: undefined,
      };

      const result = normalizePageResponse(springPage, { page: 1, size: 5 });
      expect(result.content).toEqual([{ id: '1' }]);
      expect(result.pageInfo.page).toBe(1);
      expect(result.pageInfo.size).toBe(5);
    });
  });

  describe('extractErrorMessage', () => {
    it('extracts message from Error object', () => {
      const error = new Error('Test error');
      expect(extractErrorMessage(error)).toBe('Test error');
    });

    it('extracts message from object with message property', () => {
      const error = { message: 'Custom error' };
      expect(extractErrorMessage(error)).toBe('Custom error');
    });

    it('extracts message from axios error response', () => {
      const error = {
        response: {
          data: {
            message: 'API error',
          },
        },
      };
      expect(extractErrorMessage(error)).toBe('API error');
    });

    it('extracts status from axios error response when message is missing', () => {
      const error = {
        response: {
          status: 404,
        },
      };
      expect(extractErrorMessage(error)).toBe('Request failed with status 404');
    });

    it('returns default message for unknown error', () => {
      expect(extractErrorMessage(null)).toBe('An unknown error occurred');
      expect(extractErrorMessage({})).toBe('An unknown error occurred');
    });
  });

  describe('isNetworkError', () => {
    it('returns true for network error with ERR_NETWORK code', () => {
      const error = { code: 'ERR_NETWORK' };
      expect(isNetworkError(error)).toBe(true);
    });

    it('returns true for error with request but no response', () => {
      const error = { request: {} };
      expect(isNetworkError(error)).toBe(true);
    });

    it('returns false for error with response', () => {
      const error = { request: {}, response: { status: 404 } };
      expect(isNetworkError(error)).toBe(false);
    });

    it('returns false for non-network errors', () => {
      expect(isNetworkError({})).toBe(false);
      expect(isNetworkError(null)).toBe(false);
    });
  });

  describe('isClientError', () => {
    it('returns true for 4xx status codes', () => {
      expect(isClientError({ response: { status: 400 } })).toBe(true);
      expect(isClientError({ response: { status: 404 } })).toBe(true);
      expect(isClientError({ response: { status: 499 } })).toBe(true);
    });

    it('returns false for 3xx status codes', () => {
      expect(isClientError({ response: { status: 300 } })).toBe(false);
      expect(isClientError({ response: { status: 399 } })).toBe(false);
    });

    it('returns false for 5xx status codes', () => {
      expect(isClientError({ response: { status: 500 } })).toBe(false);
      expect(isClientError({ response: { status: 599 } })).toBe(false);
    });

    it('returns false for errors without response', () => {
      expect(isClientError({})).toBe(false);
      expect(isClientError(null)).toBe(false);
    });
  });

  describe('isServerError', () => {
    it('returns true for 5xx status codes', () => {
      expect(isServerError({ response: { status: 500 } })).toBe(true);
      expect(isServerError({ response: { status: 502 } })).toBe(true);
      expect(isServerError({ response: { status: 599 } })).toBe(true);
    });

    it('returns false for 4xx status codes', () => {
      expect(isServerError({ response: { status: 400 } })).toBe(false);
      expect(isServerError({ response: { status: 404 } })).toBe(false);
    });

    it('returns false for errors without response', () => {
      expect(isServerError({})).toBe(false);
      expect(isServerError(null)).toBe(false);
    });
  });
});

