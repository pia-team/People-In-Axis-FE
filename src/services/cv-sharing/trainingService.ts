import axios from '@/services/api';
import {
  TrainingExample,
  CreateTrainingExampleRequest,
  ExportTrainingDataRequest,
  TrainingStats,
  PagedTrainingExamples,
} from '@/types/cv-sharing/training';

const BASE_URL = 'matching/training';

class TrainingService {
  async createTrainingExample(request: CreateTrainingExampleRequest): Promise<TrainingExample> {
    const res = await axios.post<TrainingExample>(`${BASE_URL}/examples`, request);
    return res.data;
  }

  async getTrainingExamples(page: number = 0, size: number = 20): Promise<PagedTrainingExamples> {
    const res = await axios.get<PagedTrainingExamples>(`${BASE_URL}/examples`, {
      params: { page, size },
    });
    return res.data;
  }

  async getTrainingExample(id: number): Promise<TrainingExample> {
    const res = await axios.get<TrainingExample>(`${BASE_URL}/examples/${id}`);
    return res.data;
  }

  async updateTrainingExample(id: number, relevanceLabel: number): Promise<TrainingExample> {
    const res = await axios.put<TrainingExample>(
      `${BASE_URL}/examples/${id}`,
      null,
      { params: { relevanceLabel } }
    );
    return res.data;
  }

  async deleteTrainingExample(id: number): Promise<void> {
    await axios.delete(`${BASE_URL}/examples/${id}`);
  }

  async exportTrainingData(request?: ExportTrainingDataRequest): Promise<TrainingExample[]> {
    const res = await axios.post<TrainingExample[]>(`${BASE_URL}/export`, request || {});
    return res.data;
  }

  async getTrainingStats(): Promise<TrainingStats> {
    const res = await axios.get<TrainingStats>(`${BASE_URL}/stats`);
    return res.data;
  }
}

export const trainingService = new TrainingService();

