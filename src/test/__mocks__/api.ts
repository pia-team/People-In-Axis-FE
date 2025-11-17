import { vi } from 'vitest';

export const mockApiClient = {
  get: vi.fn(),
  post: vi.fn(),
  put: vi.fn(),
  patch: vi.fn(),
  delete: vi.fn(),
};

export const mockAxiosResponse = <T>(data: T) => ({
  data,
  status: 200,
  statusText: 'OK',
  headers: {},
  config: {},
});

export const mockAxiosError = (status: number, message: string) => ({
  response: {
    status,
    data: { message },
    headers: {},
  },
  message,
  isAxiosError: true,
});

