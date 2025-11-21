/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// LibreTranslate API URL (can be overridden via env variable)
const API_URL = process.env.TRANSLATE_API_URL || 'https://libretranslate.com/translate';
const ROOT = path.resolve(__dirname, '..');
const LOCALES_DIR = path.resolve(ROOT, './locales');
const CACHE_FILE = path.resolve(ROOT, './cache.json');

// Supported languages by LibreTranslate
const SUPPORTED_LANGUAGES = {
  'en': 'English',
  'ar': 'Arabic',
  'az': 'Azerbaijani',
  'zh': 'Chinese',
  'cs': 'Czech',
  'nl': 'Dutch',
  'eo': 'Esperanto',
  'fi': 'Finnish',
  'fr': 'French',
  'de': 'German',
  'el': 'Greek',
  'hi': 'Hindi',
  'hu': 'Hungarian',
  'id': 'Indonesian',
  'ga': 'Irish',
  'it': 'Italian',
  'ja': 'Japanese',
  'ko': 'Korean',
  'pl': 'Polish',
  'pt': 'Portuguese',
  'ru': 'Russian',
  'sk': 'Slovak',
  'es': 'Spanish',
  'sv': 'Swedish',
  'tr': 'Turkish',
  'uk': 'Ukrainian',
  'vi': 'Vietnamese'
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const readJson = (p) => {
  try {
    return JSON.parse(fs.readFileSync(p, 'utf-8'));
  } catch (e) {
    console.error(`Error reading ${p}:`, e.message);
    return null;
  }
};

const writeJson = (p, obj) => {
  try {
    fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n', 'utf-8');
    return true;
  } catch (e) {
    console.error(`Error writing ${p}:`, e.message);
    return false;
  }
};

/**
 * Flattens nested JSON object to dot notation keys
 * Example: { common: { save: "Save" } } => { "common.save": "Save" }
 */
function flatten(obj, prefix = '') {
  return Object.keys(obj).reduce((acc, k) => {
    const pre = prefix ? `${prefix}.` : '';
    const val = obj[k];
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      Object.assign(acc, flatten(val, pre + k));
    } else {
      acc[pre + k] = String(val);
    }
    return acc;
  }, {});
}

/**
 * Unflattens dot notation keys to nested JSON object
 * Example: { "common.save": "Save" } => { common: { save: "Save" } }
 */
function unflatten(dict) {
  const res = {};
  for (const [flatKey, value] of Object.entries(dict)) {
    const parts = flatKey.split('.');
    let cursor = res;
    parts.forEach((p, i) => {
      if (i === parts.length - 1) {
        cursor[p] = value;
      } else {
        cursor[p] = cursor[p] || {};
        cursor = cursor[p];
      }
    });
  }
  return res;
}

/**
 * Translate a single text using LibreTranslate API
 */
async function translateOne(q, source, target, retries = 3) {
  if (!q || q.trim() === '') return q;
  
  const body = { 
    q, 
    source, 
    target, 
    format: 'text' 
  };

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const resp = await fetch(API_URL, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(body),
      });

      if (!resp.ok) {
        if (resp.status === 429) {
          // Rate limit - wait longer
          console.warn(`Rate limited, waiting 5 seconds...`);
          await sleep(5000);
          continue;
        }
        throw new Error(`HTTP ${resp.status}: ${resp.statusText}`);
      }

      const data = await resp.json();
      return data.translatedText || q;
    } catch (e) {
      if (attempt === retries - 1) {
        throw e;
      }
      console.warn(`Translation attempt ${attempt + 1} failed: ${e.message}, retrying...`);
      await sleep(2000 * (attempt + 1)); // Exponential backoff
    }
  }
  
  return q; // Fallback to original text
}

/**
 * Check if language is supported
 */
function isLanguageSupported(lang) {
  return SUPPORTED_LANGUAGES.hasOwnProperty(lang.toLowerCase());
}

/**
 * Get language name
 */
function getLanguageName(lang) {
  return SUPPORTED_LANGUAGES[lang.toLowerCase()] || lang.toUpperCase();
}

/**
 * Translate entire locale file
 */
async function translateLocale(targetLang, options = {}) {
  const {
    force = false,
    chunkSize = 10,
    delay = 1000,
    verbose = true
  } = options;

  const targetLangLower = targetLang.toLowerCase();
  
  if (!isLanguageSupported(targetLangLower)) {
    console.error(`❌ Language "${targetLang}" is not supported by LibreTranslate.`);
    console.log(`Supported languages: ${Object.keys(SUPPORTED_LANGUAGES).join(', ')}`);
    return false;
  }

  if (targetLangLower === 'en') {
    console.warn(`⚠️  Skipping English (source language)`);
    return false;
  }

  // Ensure locales directory exists
  if (!fs.existsSync(LOCALES_DIR)) {
    fs.mkdirSync(LOCALES_DIR, { recursive: true });
  }

  // Load or create cache
  if (!fs.existsSync(CACHE_FILE)) {
    writeJson(CACHE_FILE, {});
  }
  const cache = readJson(CACHE_FILE) || {};

  // Load base English file
  const enPath = path.join(LOCALES_DIR, 'en.json');
  if (!fs.existsSync(enPath)) {
    console.error(`❌ Missing base file: ${enPath}`);
    return false;
  }

  const base = readJson(enPath);
  if (!base) {
    return false;
  }

  // Check if target file already exists
  const targetPath = path.join(LOCALES_DIR, `${targetLangLower}.json`);
  let existingTranslations = {};
  if (fs.existsSync(targetPath) && !force) {
    existingTranslations = readJson(targetPath) || {};
    if (verbose) {
      console.log(`📄 Found existing translations for ${targetLangLower}, will merge...`);
    }
  }

  // Flatten base JSON to dot notation
  const baseFlat = flatten(base);
  const existingFlat = flatten(existingTranslations);
  
  // Find missing translations
  const missingKeys = Object.keys(baseFlat).filter(key => !existingFlat[key] || force);
  const outFlat = { ...existingFlat };

  if (missingKeys.length === 0) {
    console.log(`✅ All translations exist for ${targetLangLower}. Use --force to retranslate.`);
    return true;
  }

  console.log(`\n🌐 Translating to ${getLanguageName(targetLang)} (${targetLangLower})`);
  console.log(`   Source: ${enPath}`);
  console.log(`   Target: ${targetPath}`);
  console.log(`   Missing keys: ${missingKeys.length} / ${Object.keys(baseFlat).length}`);
  console.log(`   Chunk size: ${chunkSize}, Delay: ${delay}ms\n`);

  let translated = 0;
  let failed = 0;
  let cached = 0;

  // Process in chunks
  for (let i = 0; i < missingKeys.length; i += chunkSize) {
    const batch = missingKeys.slice(i, i + chunkSize);
    
    await Promise.all(
      batch.map(async (key) => {
        const value = baseFlat[key];
        const cacheKey = `${key}|en|${targetLangLower}|${value}`;
        
        // Check cache first
        if (cache[cacheKey] && !force) {
          outFlat[key] = cache[cacheKey];
          cached++;
          if (verbose) {
            console.log(`💾 [Cached] ${key}`);
          }
          return;
        }

        try {
          const translatedText = await translateOne(value, 'en', targetLangLower);
          outFlat[key] = translatedText;
          cache[cacheKey] = translatedText;
          translated++;
          
          if (verbose) {
            console.log(`✅ [${targetLangLower.toUpperCase()}] ${key}`);
            console.log(`   "${value}" → "${translatedText}"`);
          }
        } catch (e) {
          console.warn(`❌ Failed to translate ${key}: ${e.message}`);
          outFlat[key] = value; // Fallback to English
          failed++;
        }

        // Rate limiting delay
        await sleep(delay);
      })
    );

    // Progress update
    const progress = Math.round(((i + batch.length) / missingKeys.length) * 100);
    console.log(`📊 Progress: ${progress}% (${i + batch.length}/${missingKeys.length})\n`);
  }

  // Unflatten back to nested structure
  const output = unflatten(outFlat);

  // Write translated file
  if (writeJson(targetPath, output)) {
    // Save cache
    writeJson(CACHE_FILE, cache);
    
    console.log(`\n✅ Translation complete!`);
    console.log(`   Translated: ${translated}`);
    console.log(`   Cached: ${cached}`);
    console.log(`   Failed: ${failed}`);
    console.log(`   File: ${targetPath}\n`);
    
    return true;
  }

  return false;
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    console.log(`
🌐 LibreTranslate Auto Translation Tool

Usage:
  npm run i18n:translate [language-codes...] [options]

Examples:
  npm run i18n:translate tr              # Translate to Turkish
  npm run i18n:translate tr fr de        # Translate to multiple languages
  npm run i18n:translate tr --force      # Force retranslate existing file
  npm run i18n:translate tr --chunk 5    # Use chunk size of 5
  npm run i18n:translate tr --delay 500  # Use delay of 500ms

Options:
  --force, -f        Force retranslate even if translation exists
  --chunk <size>     Number of translations per batch (default: 10)
  --delay <ms>       Delay between API calls in ms (default: 1000)
  --quiet, -q        Suppress verbose output
  --help, -h         Show this help message

Supported Languages:
  ${Object.entries(SUPPORTED_LANGUAGES)
    .map(([code, name]) => `  ${code.padEnd(3)} - ${name}`)
    .join('\n  ')}

Environment Variables:
  TRANSLATE_API_URL  Override LibreTranslate API URL (default: https://libretranslate.com/translate)
    `);
    return;
  }

  // Parse options
  const languages = [];
  const options = {
    force: args.includes('--force') || args.includes('-f'),
    quiet: args.includes('--quiet') || args.includes('-q'),
    chunkSize: 10,
    delay: 1000
  };

  // Extract chunk size
  const chunkIndex = args.indexOf('--chunk');
  if (chunkIndex !== -1 && args[chunkIndex + 1]) {
    options.chunkSize = parseInt(args[chunkIndex + 1], 10) || 10;
  }

  // Extract delay
  const delayIndex = args.indexOf('--delay');
  if (delayIndex !== -1 && args[delayIndex + 1]) {
    options.delay = parseInt(args[delayIndex + 1], 10) || 1000;
  }

  // Extract language codes (everything that's not an option)
  args.forEach(arg => {
    if (!arg.startsWith('--') && !arg.startsWith('-') && 
        (!args.includes(`--chunk`) || arg !== args[chunkIndex + 1]) &&
        (!args.includes(`--delay`) || arg !== args[delayIndex + 1])) {
      languages.push(arg);
    }
  });

  if (languages.length === 0) {
    console.error('❌ No language codes provided. Use --help for usage information.');
    process.exit(1);
  }

  // Translate for each language
  options.verbose = !options.quiet;
  const results = [];

  for (const lang of languages) {
    const result = await translateLocale(lang, options);
    results.push({ lang, success: result });
    
    // Small delay between languages
    if (languages.length > 1) {
      await sleep(2000);
    }
  }

  // Summary
  console.log('\n📋 Summary:');
  results.forEach(({ lang, success }) => {
    const icon = success ? '✅' : '❌';
    console.log(`   ${icon} ${lang.toUpperCase()}: ${success ? 'Success' : 'Failed'}`);
  });
  
  const allSuccess = results.every(r => r.success);
  process.exit(allSuccess ? 0 : 1);
}

// Run if called directly
if (require.main === module) {
  main().catch((e) => {
    console.error('❌ Fatal error:', e);
    process.exit(1);
  });
}

module.exports = { translateLocale, SUPPORTED_LANGUAGES, isLanguageSupported };
