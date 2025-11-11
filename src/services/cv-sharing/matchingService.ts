import axios from '@/services/api';
import { apiPath } from '@/config/apiPaths';
import { MatchingConfig, SkillAliasItem } from '@/types/cv-sharing/matching';

class MatchingService {
  private baseUrl = apiPath('matching');

  async getConfig(): Promise<MatchingConfig> {
    const res = await axios.get<MatchingConfig>(`${this.baseUrl}/config`);
    return res.data;
    }

  async updateConfig(cfg: MatchingConfig): Promise<MatchingConfig> {
    const res = await axios.put<MatchingConfig>(`${this.baseUrl}/config`, cfg);
    return res.data;
  }

  async listAliases(): Promise<SkillAliasItem[]> {
    const res = await axios.get<SkillAliasItem[]>(`${this.baseUrl}/skill-alias`);
    return res.data;
  }

  async upsertAlias(alias: Omit<SkillAliasItem, 'id'>): Promise<SkillAliasItem> {
    const res = await axios.post<SkillAliasItem>(`${this.baseUrl}/skill-alias`, alias);
    return res.data;
  }

  async updateAlias(id: string, alias: Omit<SkillAliasItem, 'id'>): Promise<SkillAliasItem> {
    const res = await axios.put<SkillAliasItem>(`${this.baseUrl}/skill-alias/${id}`, alias);
    return res.data;
  }

  async deleteAlias(id: string): Promise<void> {
    await axios.delete(`${this.baseUrl}/skill-alias/${id}`);
  }
}

export const matchingService = new MatchingService();
