import { describe, it, expect, vi, beforeEach } from 'vitest';
import { matchingService } from '@/services/cv-sharing/matchingService';
import axios from '@/services/api';
import type { MatchingConfig, SkillAliasItem } from '@/types/cv-sharing/matching';

vi.mock('@/services/api');
vi.mock('@/config/apiPaths', () => ({
  apiPath: (path: string) => `/api/${path}`,
}));

describe('matchingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getConfig fetches matching config', async () => {
    const mockConfig: MatchingConfig = {
      skillWeight: 0.5,
      experienceWeight: 0.3,
      languageWeight: 0.2,
    };
    vi.mocked(axios.get).mockResolvedValue({ data: mockConfig } as any);

    const result = await matchingService.getConfig();
    expect(result).toEqual(mockConfig);
    expect(vi.mocked(axios.get)).toHaveBeenCalledWith('/api/matching/config');
  });

  it('updateConfig updates matching config', async () => {
    const mockConfig: MatchingConfig = {
      skillWeight: 0.6,
      experienceWeight: 0.25,
      languageWeight: 0.15,
    };
    vi.mocked(axios.put).mockResolvedValue({ data: mockConfig } as any);

    const result = await matchingService.updateConfig(mockConfig);
    expect(result).toEqual(mockConfig);
    expect(vi.mocked(axios.put)).toHaveBeenCalledWith(
      '/api/matching/config',
      mockConfig
    );
  });

  it('listAliases fetches skill aliases', async () => {
    const mockAliases: SkillAliasItem[] = [
      { id: '1', canonical: 'JavaScript', aliases: ['JS', 'ECMAScript'] },
      { id: '2', canonical: 'TypeScript', aliases: ['TS'] },
    ];
    vi.mocked(axios.get).mockResolvedValue({ data: mockAliases } as any);

    const result = await matchingService.listAliases();
    expect(result).toEqual(mockAliases);
    expect(vi.mocked(axios.get)).toHaveBeenCalledWith('/api/matching/skill-alias');
  });

  it('upsertAlias creates a new skill alias', async () => {
    const newAlias: Omit<SkillAliasItem, 'id'> = {
      canonical: 'React',
      aliases: ['ReactJS', 'React.js'],
    };
    const mockAlias: SkillAliasItem = {
      id: '3',
      ...newAlias,
    };
    vi.mocked(axios.post).mockResolvedValue({ data: mockAlias } as any);

    const result = await matchingService.upsertAlias(newAlias);
    expect(result).toEqual(mockAlias);
    expect(vi.mocked(axios.post)).toHaveBeenCalledWith(
      '/api/matching/skill-alias',
      newAlias
    );
  });

  it('updateAlias updates an existing skill alias', async () => {
    const updateAlias: Omit<SkillAliasItem, 'id'> = {
      canonical: 'JavaScript',
      aliases: ['JS', 'ECMAScript', 'ES6'],
    };
    const mockAlias: SkillAliasItem = {
      id: '1',
      ...updateAlias,
    };
    vi.mocked(axios.put).mockResolvedValue({ data: mockAlias } as any);

    const result = await matchingService.updateAlias('1', updateAlias);
    expect(result).toEqual(mockAlias);
    expect(vi.mocked(axios.put)).toHaveBeenCalledWith(
      '/api/matching/skill-alias/1',
      updateAlias
    );
  });

  it('deleteAlias deletes a skill alias', async () => {
    vi.mocked(axios.delete).mockResolvedValue({} as any);

    await matchingService.deleteAlias('1');
    expect(vi.mocked(axios.delete)).toHaveBeenCalledWith(
      '/api/matching/skill-alias/1'
    );
  });
});

