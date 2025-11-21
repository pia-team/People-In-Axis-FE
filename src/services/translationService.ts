import { apiClient } from './api';

/**
 * Translation service for fetching translations from backend
 * Uses LibreTranslate via backend API
 */
export const translationService = {
  /**
   * Get all translations for a specific language
   * @param lang Language code (e.g., 'en', 'tr')
   * @returns Promise resolving to a map of translation keys to values
   */
  getTranslations: async (lang: string): Promise<Record<string, string>> => {
    const response = await apiClient.get<Record<string, string>>(`/translations/${lang}`);
    return response.data;
  },

  /**
   * Translate a single text using LibreTranslate
   * @param text Text to translate
   * @param target Target language code
   * @returns Promise resolving to translated text
   */
  translate: async (text: string, target: string): Promise<string> => {
    const response = await apiClient.post<{ translatedText: string }>('/translations/translate', null, {
      params: { text, target },
    });
    return response.data.translatedText;
  },
};

