import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { translationService } from './services/translationService';
import en from './locales/en.json';
import tr from './locales/tr.json';

const savedLang = (typeof window !== 'undefined' && localStorage.getItem('lang')) || 'en';

/**
 * Convert flat key-value translations to nested structure
 * Backend returns flat structure (e.g., "common.dashboard": "Dashboard")
 * i18next needs nested structure (e.g., { common: { dashboard: "Dashboard" } })
 */
const unflattenTranslations = (flat: Record<string, string>): Record<string, any> => {
  const nested: Record<string, any> = {};
  
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split('.');
    let current = nested;
    
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      if (!current[part]) {
        current[part] = {};
      }
      current = current[part];
    }
    
    current[parts[parts.length - 1]] = value;
  }
  
  return nested;
};

/**
 * Load translations dynamically from backend (uses LibreTranslate)
 * Falls back to static JSON if backend is unavailable
 */
const loadTranslations = async (lang: string): Promise<Record<string, any>> => {
  // First priority: Use static JSON files (they are reliable, fast, and complete)
  try {
    if (lang === 'en') {
      return en;
    }
    if (lang === 'tr') {
      return tr;
    }
    
    // For other languages, try to import static file first
    try {
      const staticModule = await import(`./locales/${lang}.json`);
      if (staticModule.default) {
        return staticModule.default;
      }
    } catch {
      // Static file doesn't exist, will try backend
    }
  } catch (staticError) {
    // Will try backend
  }
  
  // Second priority: Try backend (LibreTranslate) if static file doesn't exist
  // Backend returns flat structure, we need to convert it to nested
  try {
    const flatTranslations = await translationService.getTranslations(lang);
    
    // Check if backend returned valid translations
    if (flatTranslations && typeof flatTranslations === 'object' && Object.keys(flatTranslations).length > 0) {
      // Convert flat structure to nested structure
      const nestedTranslations = unflattenTranslations(flatTranslations);
      console.log(`Loaded ${Object.keys(flatTranslations).length} translations from backend for ${lang}`);
      return nestedTranslations;
    }
    
    // Backend returned empty, fallback to static
    throw new Error('Empty translations from backend');
  } catch (error) {
    console.warn(`Backend translation failed for ${lang}, using static fallback:`, error);
    
    // Final fallback to English
    return en;
  }
};

/**
 * Initialize i18n with static resources first, then load dynamic translations
 */
i18n
  .use(initReactI18next)
  .init({
    lng: savedLang,
    fallbackLng: 'en',
    debug: false,
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
    // Initialize with static resources immediately (fast and reliable)
    resources: {
      en: { translation: en },
      tr: { translation: tr },
    },
  });

// Load initial language translations if not already loaded
if (savedLang && savedLang !== i18n.language) {
  i18n.changeLanguage(savedLang).catch(() => {
    // Silent fail, will use English
  });
}

// Handle language changes - ensure translations are loaded immediately
i18n.on('languageChanged', async (lng) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('lang', lng);
    document.documentElement.setAttribute('lang', lng);
    
    // Ensure translations are loaded for the new language
    // Static files (en.json, tr.json) are already loaded, so this is instant
    // For other languages, try backend or fallback to static
    if (!i18n.hasResourceBundle(lng, 'translation')) {
      try {
        const translations = await loadTranslations(lng);
        i18n.addResourceBundle(lng, 'translation', translations, true, true);
        i18n.emit('loaded');
      } catch (error) {
        console.error(`Failed to load translations for ${lng}:`, error);
      }
    }
    
    // Trigger custom events for components
    window.dispatchEvent(new CustomEvent('i18n:languageChanged', { detail: { language: lng } }));
    window.dispatchEvent(new CustomEvent('i18n:loaded', { detail: { language: lng } }));
  }
});

export default i18n;
