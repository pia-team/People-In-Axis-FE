import axios from '@/services/api';
import {
  ModelRegistry,
  CreateModelRequest,
  PagedModels,
  ModelStatus,
} from '@/types/cv-sharing/model';

const BASE_URL = 'matching/models';

class ModelRegistryService {
  async registerModel(request: CreateModelRequest): Promise<ModelRegistry> {
    const res = await axios.post<ModelRegistry>(BASE_URL, request);
    return res.data;
  }

  async getModels(page: number = 0, size: number = 20): Promise<PagedModels> {
    const res = await axios.get<PagedModels>(BASE_URL, {
      params: { page, size },
    });
    return res.data;
  }

  async getModel(id: number): Promise<ModelRegistry> {
    const res = await axios.get<ModelRegistry>(`${BASE_URL}/${id}`);
    return res.data;
  }

  async getActiveModel(): Promise<ModelRegistry> {
    const res = await axios.get<ModelRegistry>(`${BASE_URL}/active`);
    return res.data;
  }

  async activateModel(id: number): Promise<ModelRegistry> {
    const res = await axios.put<ModelRegistry>(`${BASE_URL}/${id}/activate`);
    return res.data;
  }

  async updateModelStatus(id: number, status: ModelStatus): Promise<ModelRegistry> {
    const res = await axios.put<ModelRegistry>(
      `${BASE_URL}/${id}/status`,
      null,
      { params: { status } }
    );
    return res.data;
  }
}

export const modelRegistryService = new ModelRegistryService();

