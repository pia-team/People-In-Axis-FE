export type ReviewTaskStatus = 'PENDING' | 'ASSIGNED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
export type ReviewTaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';

export interface ReviewTask {
  id: number;
  companyUuid?: string;
  poolCvId: string;
  poolCvName?: string;
  positionId: string;
  positionTitle?: string;
  uncertaintyScore: number;
  matchScore?: number;
  status: ReviewTaskStatus;
  assignedTo?: string;
  assignedToName?: string;
  priority: ReviewTaskPriority;
  completedAt?: string;
  completedBy?: string;
  relevanceLabel?: number;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface CompleteReviewTaskRequest {
  relevanceLabel: 0 | 1 | 2 | 3;
  notes?: string;
}

export interface GenerateReviewTasksRequest {
  positionId?: string;
  minUncertainty?: number;
  limit?: number;
}

export interface ReviewTaskStats {
  total: number;
  pending: number;
  assigned: number;
  inProgress: number;
  completed: number;
}

export interface PagedReviewTasks {
  content: ReviewTask[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}

