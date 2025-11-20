export type ModelStatus = 'TRAINING' | 'ACTIVE' | 'DEPRECATED' | 'FAILED';
export type ModelType = 'LAMBDA_MART' | 'XGBOOST' | 'LIGHTGBM' | 'NEURAL_RANKER';

export interface ModelRegistry {
  id: number;
  companyUuid?: string;
  version: string;
  modelType: string;
  modelPath: string;
  trainingConfig?: Record<string, any>;
  metrics?: Record<string, any>;
  trainingExamplesCount?: number;
  trainingDateFrom?: string;
  trainingDateTo?: string;
  status: ModelStatus;
  isActive: boolean;
  activatedAt?: string;
  activatedBy?: string;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateModelRequest {
  version: string;
  modelType?: string;
  modelPath: string;
  trainingConfig?: Record<string, any>;
  metrics?: Record<string, any>;
  trainingExamplesCount?: number;
  trainingDateFrom?: string;
  trainingDateTo?: string;
  notes?: string;
}

export interface PagedModels {
  content: ModelRegistry[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

