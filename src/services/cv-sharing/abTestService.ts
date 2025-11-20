import axios from '@/services/api';
import {
  AbTest,
  CreateAbTestRequest,
  PagedAbTests,
} from '@/types/cv-sharing/ab-test';

const BASE_URL = 'matching/ab-tests';

class AbTestService {
  async createAbTest(request: CreateAbTestRequest): Promise<AbTest> {
    const res = await axios.post<AbTest>(BASE_URL, request);
    return res.data;
  }

  async getAbTests(page: number = 0, size: number = 20): Promise<PagedAbTests> {
    const res = await axios.get<PagedAbTests>(BASE_URL, {
      params: { page, size },
    });
    return res.data;
  }

  async getAbTest(id: number): Promise<AbTest> {
    const res = await axios.get<AbTest>(`${BASE_URL}/${id}`);
    return res.data;
  }

  async startAbTest(id: number): Promise<AbTest> {
    const res = await axios.put<AbTest>(`${BASE_URL}/${id}/start`);
    return res.data;
  }

  async pauseAbTest(id: number): Promise<AbTest> {
    const res = await axios.put<AbTest>(`${BASE_URL}/${id}/pause`);
    return res.data;
  }

  async completeAbTest(id: number): Promise<AbTest> {
    const res = await axios.put<AbTest>(`${BASE_URL}/${id}/complete`);
    return res.data;
  }
}

export const abTestService = new AbTestService();

