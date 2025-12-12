import api from '../api';
import {
  EvaluationQuestion,
  CreateEvaluationRequest,
  EvaluationResponse,
  EvaluationSummary,
  EvaluationProgress,
} from '../../types/cv-sharing/evaluation';

/**
 * Service for managing application evaluations
 */
export const evaluationService = {
  /**
   * Get evaluation questions
   */
  getQuestions: async (applicationId: string): Promise<EvaluationQuestion[]> => {
    const response = await api.get<EvaluationQuestion[]>(
      `/api/applications/${applicationId}/evaluations/questions`
    );
    return response.data;
  },

  /**
   * Check if current user can evaluate the application
   */
  canEvaluate: async (applicationId: string): Promise<boolean> => {
    const response = await api.get<boolean>(
      `/api/applications/${applicationId}/evaluations/can-evaluate`
    );
    return response.data;
  },

  /**
   * Create/submit evaluation
   */
  createEvaluation: async (
    applicationId: string,
    data: CreateEvaluationRequest
  ): Promise<EvaluationResponse> => {
    const response = await api.post<EvaluationResponse>(
      `/api/applications/${applicationId}/evaluations`,
      data
    );
    return response.data;
  },

  /**
   * Get evaluation summary (HR/MANAGER only)
   */
  getEvaluationSummary: async (applicationId: string): Promise<EvaluationSummary> => {
    const response = await api.get<EvaluationSummary>(
      `/api/applications/${applicationId}/evaluations/summary`
    );
    return response.data;
  },

  /**
   * Get evaluation progress (HR/MANAGER only)
   */
  getEvaluationProgress: async (applicationId: string): Promise<EvaluationProgress> => {
    const response = await api.get<EvaluationProgress>(
      `/api/applications/${applicationId}/evaluations/progress`
    );
    return response.data;
  },

  /**
   * Get evaluation detail
   */
  getEvaluationDetail: async (
    applicationId: string,
    evaluationId: string
  ): Promise<EvaluationResponse> => {
    const response = await api.get<EvaluationResponse>(
      `/api/applications/${applicationId}/evaluations/${evaluationId}`
    );
    return response.data;
  },
};

