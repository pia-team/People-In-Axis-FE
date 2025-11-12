import { apiClient } from './api';

export interface LanguageDto { code: string; name: string }

export const languageService = {
  getActive: async (): Promise<LanguageDto[]> => {
    const res = await apiClient.get<LanguageDto[]>('languages/active');
    return res.data;
  },
  getAll: async (): Promise<LanguageDto[]> => {
    const res = await apiClient.get<LanguageDto[]>('languages/all');
    return res.data;
  },
  add: async (code: string, name?: string): Promise<LanguageDto> => {
    const res = await apiClient.post<LanguageDto>('languages', { code, name });
    return res.data;
  },
  remove: async (code: string): Promise<void> => {
    await apiClient.delete(`languages/${encodeURIComponent(code)}`);
  },
};
