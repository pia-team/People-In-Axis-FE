/**
 * Evaluation related types for Application Evaluation feature
 */

export interface EvaluationQuestion {
  id: string;
  questionText: string;
  questionOrder: number;
  questionCategory: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface EvaluationAnswerRequest {
  questionId: string;
  score: number; // 0-10
  comment?: string;
}

export interface CreateEvaluationRequest {
  answers: EvaluationAnswerRequest[];
  generalComment?: string;
}

export interface EvaluationAnswer {
  questionId: string;
  questionText: string;
  questionCategory: string;
  questionOrder: number;
  score: number;
  comment?: string;
}

export interface UserSummary {
  id: string;
  fullName: string;
  email: string;
}

export interface EvaluationResponse {
  id: string;
  applicationId: string;
  applicantName: string;
  positionTitle: string;
  evaluatedBy: UserSummary;
  generalComment?: string;
  totalScore: number;
  answers: EvaluationAnswer[];
  evaluatedAt: string;
}

export interface EvaluatorSummary {
  evaluationId: string;
  evaluatorName: string;
  evaluatorEmail: string;
  score: number;
  evaluatedAt: string;
}

export interface EvaluationSummary {
  applicationId: string;
  totalForwardings: number;
  completedEvaluations: number;
  averageScore: number;
  evaluators: EvaluatorSummary[];
}

export interface ForwardingProgress {
  forwardingId: string;
  forwardedToName: string;
  forwardedToEmail: string;
  forwardedAt: string;
  evaluationDeadline?: string;
  isCompleted: boolean;
  evaluatedAt?: string;
}

export interface EvaluationProgress {
  applicationId: string;
  totalForwardings: number;
  completedEvaluations: number;
  completionPercentage: number;
  forwardings: ForwardingProgress[];
}

// Question category colors
export const CATEGORY_COLORS: Record<string, string> = {
  'Teknik Yeterlilik': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'İletişim': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'Ekip Uyumu': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
  'Analitik Düşünce': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  'Motivasyon': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
  'Gelişim': 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-200',
  'Deneyim': 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200',
  'Kültürel Uyum': 'bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-200',
  'Liderlik': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  'Genel': 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
};

// Score color utilities
export const getScoreColor = (score: number): string => {
  if (score >= 8) return 'text-green-600 dark:text-green-400';
  if (score >= 6) return 'text-yellow-600 dark:text-yellow-400';
  return 'text-red-600 dark:text-red-400';
};

export const getScoreBgColor = (score: number): string => {
  if (score >= 8) return 'bg-green-100 dark:bg-green-900';
  if (score >= 6) return 'bg-yellow-100 dark:bg-yellow-900';
  return 'bg-red-100 dark:bg-red-900';
};

export const getScoreBorderColor = (score: number): string => {
  if (score >= 8) return 'border-green-200 dark:border-green-700';
  if (score >= 6) return 'border-yellow-200 dark:border-yellow-700';
  return 'border-red-200 dark:border-red-700';
};

