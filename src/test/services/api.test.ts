import { describe, it, expect, vi, beforeEach } from 'vitest';
import { apiClient, setAuthToken } from '@/services/api';

// Mock axios and toast
vi.mock('axios', async () => {
  const actual = await vi.importActual('axios');
  return {
    ...actual,
    default: {
      create: vi.fn(() => ({
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
        interceptors: {
          request: { use: vi.fn() },
          response: { use: vi.fn() },
        },
      })),
    },
  };
});

vi.mock('@/utils/toast', () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}));

describe('api', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    setAuthToken(null);
  });

  describe('apiClient', () => {
    it('exposes GET method', () => {
      expect(apiClient).toBeDefined();
      expect(typeof apiClient.get).toBe('function');
    });

    it('exposes POST method', () => {
      expect(typeof apiClient.post).toBe('function');
    });

    it('exposes PUT method', () => {
      expect(typeof apiClient.put).toBe('function');
    });

    it('exposes PATCH method', () => {
      expect(typeof apiClient.patch).toBe('function');
    });

    it('exposes DELETE method', () => {
      expect(typeof apiClient.delete).toBe('function');
    });
  });

  describe('setAuthToken', () => {
    it('sets auth token without throwing', () => {
      expect(() => setAuthToken('test-token')).not.toThrow();
    });

    it('clears auth token when null is passed', () => {
      setAuthToken('test-token');
      expect(() => setAuthToken(null)).not.toThrow();
    });
  });
});
