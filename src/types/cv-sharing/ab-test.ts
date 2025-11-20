export type AbTestStatus = 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED';

export interface AbTest {
  id: number;
  companyUuid?: string;
  testName: string;
  description?: string;
  variants?: Record<string, any>;
  trafficSplit?: Record<string, number>;
  metrics?: string[];
  status: AbTestStatus;
  startDate?: string;
  endDate?: string;
  results?: Record<string, any>;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateAbTestRequest {
  testName: string;
  description?: string;
  variants: Record<string, any>;
  trafficSplit: Record<string, number>;
  metrics?: string[];
  startDate?: string;
  endDate?: string;
}

export interface PagedAbTests {
  content: AbTest[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

