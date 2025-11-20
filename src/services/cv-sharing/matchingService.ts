import axios from '@/services/api';
import { MatchingConfig, SkillAliasItem } from '@/types/cv-sharing/matching';

// Backend endpoint: /api/matching/*
const BASE_URL = 'matching';

class MatchingService {
  async getConfig(): Promise<MatchingConfig> {
    const res = await axios.get<MatchingConfig>(`${BASE_URL}/config`);
    return res.data;
  }

  async updateConfig(cfg: MatchingConfig): Promise<MatchingConfig> {
    const res = await axios.put<MatchingConfig>(`${BASE_URL}/config`, cfg);
    return res.data;
  }

  listAliases = async (): Promise<SkillAliasItem[]> => {
    try {
      console.log('[MatchingService] listAliases - baseUrl:', BASE_URL);
      const res = await axios.get<SkillAliasItem[]>(`${BASE_URL}/skill-alias`);
      console.log('[MatchingService] listAliases - raw response:', res);
      // Ensure IDs are strings (backend returns UUID)
      const aliases = res.data?.map(item => ({
        ...item,
        id: String(item.id)
      })) || [];
      console.log('[MatchingService] listAliases - processed aliases:', aliases);
      return aliases;
    } catch (error) {
      console.error('[MatchingService] listAliases error:', error);
      throw error;
    }
  };

  upsertAlias = async (alias: Omit<SkillAliasItem, 'id'>): Promise<SkillAliasItem> => {
    try {
      console.log('[MatchingService] upsertAlias - baseUrl:', BASE_URL, 'alias:', alias);
      const res = await axios.post<SkillAliasItem>(`${BASE_URL}/skill-alias`, alias);
      console.log('[MatchingService] upsertAlias - raw response:', res);
      // Ensure ID is string (backend returns UUID)
      const result = {
        ...res.data,
        id: String(res.data.id)
      };
      console.log('[MatchingService] upsertAlias - processed result:', result);
      return result;
    } catch (error) {
      console.error('[MatchingService] upsertAlias error:', error);
      throw error;
    }
  };

  async updateAlias(id: string, alias: Omit<SkillAliasItem, 'id'>): Promise<SkillAliasItem> {
    const res = await axios.put<SkillAliasItem>(`${BASE_URL}/skill-alias/${id}`, alias);
    return {
      ...res.data,
      id: String(res.data.id)
    };
  }

  async deleteAlias(id: string): Promise<void> {
    await axios.delete(`${BASE_URL}/skill-alias/${id}`);
  }
}

export const matchingService = new MatchingService();
