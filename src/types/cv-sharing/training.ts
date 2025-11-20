export interface TrainingExample {
  id: number;
  companyUuid?: string;
  poolCvId: string;
  poolCvName?: string;
  positionId: string;
  positionTitle?: string;
  relevanceLabel: 0 | 1 | 2 | 3;
  labeledBy?: string;
  labeledByName?: string;
  labeledAt?: string;
  featuresSnapshot?: Record<string, any>;
  matchScore?: number;
  annDistance?: number;
  rerankScore?: number;
  notes?: string;
  exported?: boolean;
  exportedAt?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTrainingExampleRequest {
  poolCvId: string;
  positionId: string;
  relevanceLabel: 0 | 1 | 2 | 3;
  features?: Record<string, any>;
  notes?: string;
}

export interface ExportTrainingDataRequest {
  startDate?: string;
  endDate?: string;
  minRelevance?: number;
  maxRelevance?: number;
  includeExported?: boolean;
  format?: 'CSV' | 'JSON' | 'PARQUET';
  includeFeatures?: boolean;
}

export interface TrainingStats {
  total: number;
  exported: number;
  label0: number;
  label1: number;
  label2: number;
  label3: number;
}

export interface PagedTrainingExamples {
  content: TrainingExample[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

