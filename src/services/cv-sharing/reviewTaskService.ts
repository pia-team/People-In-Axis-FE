import axios from '@/services/api';
import {
  ReviewTask,
  CompleteReviewTaskRequest,
  GenerateReviewTasksRequest,
  ReviewTaskStats,
  PagedReviewTasks,
  ReviewTaskStatus,
} from '@/types/cv-sharing/review-task';

const BASE_URL = 'matching/review-tasks';

class ReviewTaskService {
  async getReviewTasks(
    page: number = 0,
    size: number = 20,
    status?: ReviewTaskStatus
  ): Promise<PagedReviewTasks> {
    const params: Record<string, any> = { page, size };
    if (status) {
      params.status = status;
    }
    const res = await axios.get<PagedReviewTasks>(BASE_URL, { params });
    return res.data;
  }

  async getReviewTask(id: number): Promise<ReviewTask> {
    const res = await axios.get<ReviewTask>(`${BASE_URL}/${id}`);
    return res.data;
  }

  async generateReviewTasks(request: GenerateReviewTasksRequest): Promise<{ created: number }> {
    const res = await axios.post<{ created: number }>(`${BASE_URL}/generate`, null, {
      params: request,
    });
    return res.data;
  }

  async assignReviewTask(id: number, assignedTo: string): Promise<ReviewTask> {
    const res = await axios.put<ReviewTask>(
      `${BASE_URL}/${id}/assign`,
      null,
      { params: { assignedTo } }
    );
    return res.data;
  }

  async completeReviewTask(id: number, request: CompleteReviewTaskRequest): Promise<ReviewTask> {
    const res = await axios.put<ReviewTask>(`${BASE_URL}/${id}/complete`, request);
    return res.data;
  }

  async cancelReviewTask(id: number): Promise<void> {
    await axios.put(`${BASE_URL}/${id}/cancel`);
  }

  async getReviewTaskStats(): Promise<ReviewTaskStats> {
    const res = await axios.get<ReviewTaskStats>(`${BASE_URL}/stats`);
    return res.data;
  }
}

export const reviewTaskService = new ReviewTaskService();

