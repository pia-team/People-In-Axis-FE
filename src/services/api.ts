import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { toast } from '@/utils/toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
const DEDUP_WINDOW_MS = Number(import.meta.env.VITE_API_DEDUP_MS ?? 250);
const IDEMP_TTL_MS = Number(import.meta.env.VITE_API_IDEMP_TTL_MS ?? 5000);

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
let authToken: string | null = null;

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

// Simple in-flight de-duplication for GET requests
const inFlight = new Map<string, number>();

const stableStringify = (value: any): string => {
  if (value === undefined || value === null) return '';
  if (Array.isArray(value)) return `[${value.map((v) => stableStringify(v)).join(',')}]`;
  if (typeof value === 'object') {
    return '{' + Object.keys(value).sort().map(k => `${k}:${stableStringify((value as any)[k])}`).join(',') + '}';
  }
  return String(value);
};

const buildKey = (config: InternalAxiosRequestConfig) => {
  const method = (config.method || 'get').toLowerCase();
  const url = config.url || '';
  const params = stableStringify(config.params);
  const data = stableStringify(config.data);
  return `${method}|${url}|${params}|${data}`;
};

// Idempotency key cache for write requests
const idempCache = new Map<string, { key: string; ts: number }>();
const genIdempKey = () => {
  try {
    const g: any = globalThis as any;
    if (g && g.crypto && typeof g.crypto.randomUUID === 'function') {
      return g.crypto.randomUUID();
    }
  } catch {}
  const s4 = () => Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
  return `${s4()}${s4()}-${s4()}-${s4()}-${s4()}-${s4()}${s4()}${s4()}`;
};

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    // De-dup only GET/HEAD within a short window
    const method = (config.method || 'get').toLowerCase();
    if ((method === 'get' || method === 'head') && DEDUP_WINDOW_MS > 0) {
      const key = buildKey(config);
      const now = Date.now();
      const last = inFlight.get(key);
      if (last && now - last < DEDUP_WINDOW_MS) {
        // Abort the duplicate request silently
        const controller = new AbortController();
        controller.abort();
        (config as any).__dedup_key = key;
        (config as any).__dedup_aborted = true;
        config.signal = controller.signal;
      } else {
        inFlight.set(key, now);
        (config as any).__dedup_key = key;
      }
    }
    // Attach Idempotency-Key for write requests (short TTL reuse)
    if ((method === 'post' || method === 'put' || method === 'patch' || method === 'delete') && IDEMP_TTL_MS > 0) {
      const idKey = buildKey(config);
      const now = Date.now();
      let entry = idempCache.get(idKey);
      if (!entry || (now - entry.ts) > IDEMP_TTL_MS) {
        entry = { key: genIdempKey(), ts: now };
        idempCache.set(idKey, entry);
      }
      (config.headers as any)['Idempotency-Key'] = (config.headers as any)['Idempotency-Key'] || entry.key;
      (config as any).__idemp_ref = idKey;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors globally
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Clear in-flight key if present
    const key = (response.config as any)?.__dedup_key;
    if (key) inFlight.delete(key);
    const idref = (response.config as any)?.__idemp_ref;
    if (idref) idempCache.delete(idref);
    return response;
  },
  (error: AxiosError) => {
    // Clear in-flight key if present
    const key = (error.config as any)?.__dedup_key;
    if (key) inFlight.delete(key);
    const idref = (error.config as any)?.__idemp_ref;
    if (idref) idempCache.delete(idref);

    // Ignore aborted duplicate requests
    if ((error as any).code === 'ERR_CANCELED' || (error.message || '').toLowerCase().includes('canceled')) {
      return Promise.reject(error);
    }
    const authEnabled = String(import.meta.env.VITE_AUTH_ENABLED).toLowerCase() === 'true';
    if (error.response) {
      const status = error.response.status;
      const corrId = (error.response.headers as any)?.['x-correlation-id'];
      const idempReject = (error.response.headers as any)?.['x-idempotency-reject'];
      if (status === 409 && idempReject) {
        // Suppress toast for idempotency rejections
        return Promise.reject(error);
      }
      const baseMsg = typeof error.response.data === 'object' && error.response.data && (error.response.data as any).message
        ? (error.response.data as any).message
        : `Request failed with status ${status}`;
      const msg = corrId ? `${baseMsg} (trace: ${corrId})` : baseMsg;
      if (status === 401) {
        toast.error('Session expired or unauthorized. Please login again.');
        if (authEnabled) {
          window.location.href = '/login';
        }
      } else if (status === 403) {
        toast.error(msg || 'Access forbidden');
      } else if (status === 404) {
        toast.error(msg || 'Resource not found');
      } else if (status >= 500) {
        toast.error(msg || 'Server error');
      } else {
        toast.error(msg || 'An error occurred');
      }
    } else if (error.request) {
      toast.error('No response from server. Please check your network.');
    } else {
      toast.error(error.message || 'Request error');
    }
    return Promise.reject(error);
  }
);

// Generic API methods
export const apiClient = {
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => 
    api.get<T>(url, config),
  
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => 
    api.post<T>(url, data, config),
  
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => 
    api.put<T>(url, data, config),
  
  patch: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => 
    api.patch<T>(url, data, config),
  
  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> => 
    api.delete<T>(url, config),
};

export default api;
