import { describe, it, expect, vi, beforeEach } from 'vitest';
import { languageService } from '@/services/languageService';
import { apiClient } from '@/services/api';
import type { LanguageDto } from '@/services/languageService';

vi.mock('@/services/api');

describe('languageService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('getActive fetches active languages', async () => {
    const mockLanguages: LanguageDto[] = [
      { code: 'en', name: 'English' },
      { code: 'tr', name: 'Turkish' },
    ];
    vi.mocked(apiClient.get).mockResolvedValue({ data: mockLanguages } as any);

    const result = await languageService.getActive();
    expect(result).toEqual(mockLanguages);
    expect(vi.mocked(apiClient.get)).toHaveBeenCalledWith('languages/active');
  });

  it('getAll fetches all languages', async () => {
    const mockLanguages: LanguageDto[] = [
      { code: 'en', name: 'English' },
      { code: 'tr', name: 'Turkish' },
      { code: 'de', name: 'German' },
    ];
    vi.mocked(apiClient.get).mockResolvedValue({ data: mockLanguages } as any);

    const result = await languageService.getAll();
    expect(result).toEqual(mockLanguages);
    expect(vi.mocked(apiClient.get)).toHaveBeenCalledWith('languages/all');
  });

  it('add creates a new language', async () => {
    const mockLanguage: LanguageDto = { code: 'fr', name: 'French' };
    vi.mocked(apiClient.post).mockResolvedValue({ data: mockLanguage } as any);

    const result = await languageService.add('fr', 'French');
    expect(result).toEqual(mockLanguage);
    expect(vi.mocked(apiClient.post)).toHaveBeenCalledWith('languages', { code: 'fr', name: 'French' });
  });

  it('add creates a language without name', async () => {
    const mockLanguage: LanguageDto = { code: 'es', name: 'Spanish' };
    vi.mocked(apiClient.post).mockResolvedValue({ data: mockLanguage } as any);

    const result = await languageService.add('es');
    expect(result).toEqual(mockLanguage);
    expect(vi.mocked(apiClient.post)).toHaveBeenCalledWith('languages', { code: 'es', name: undefined });
  });

  it('remove deletes a language', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({} as any);

    await languageService.remove('fr');
    expect(vi.mocked(apiClient.delete)).toHaveBeenCalledWith('languages/fr');
  });

  it('remove encodes language code with special characters', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({} as any);

    await languageService.remove('en-US');
    expect(vi.mocked(apiClient.delete)).toHaveBeenCalledWith('languages/en-US');
  });
});

