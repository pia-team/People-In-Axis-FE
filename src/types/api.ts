// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  timestamp?: string;
}

export interface ApiErrorResponse {
  code?: string;
  message: string;
  details?: Record<string, unknown>;
  timestamp?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

// Extended Axios config with internal metadata
export interface ExtendedAxiosRequestConfig {
  __dedup_key?: string;
  __dedup_aborted?: boolean;
  __idemp_ref?: string;
}

// Spring Boot Page response structure
export interface SpringPageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  numberOfElements: number;
  empty: boolean;
  pageInfo?: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

// Normalized page response
export interface NormalizedPageResponse<T> {
  content: T[];
  pageInfo: {
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
  };
}

// Type guard for API error response
export function isApiErrorResponse(data: unknown): data is ApiErrorResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    'message' in data &&
    typeof (data as ApiErrorResponse).message === 'string'
  );
}

// Type guard for Spring page response
export function isSpringPageResponse<T>(data: unknown): data is SpringPageResponse<T> {
  return (
    typeof data === 'object' &&
    data !== null &&
    'content' in data &&
    Array.isArray((data as SpringPageResponse<T>).content)
  );
}

