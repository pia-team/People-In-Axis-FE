import axios, { AxiosError, AxiosInstance, AxiosRequestConfig, AxiosResponse, InternalAxiosRequestConfig } from 'axios';
import { toast } from '@/utils/toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

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

// Request interceptor to add auth token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
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
    return response;
  },
  (error: AxiosError) => {
    const authEnabled = String(import.meta.env.VITE_AUTH_ENABLED).toLowerCase() === 'true';
    if (error.response) {
      const status = error.response.status;
      const corrId = (error.response.headers as any)?.['x-correlation-id'];
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
