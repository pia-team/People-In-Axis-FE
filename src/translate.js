/* eslint-disable no-console */
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const API_URL = process.env.TRANSLATE_API_URL || 'https://libretranslate.com/translate';
const ROOT = __dirname;
const LOCALES_DIR = path.resolve(ROOT, './locales');
const CACHE_FILE = path.resolve(ROOT, './cache.json');

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const readJson = (p) => JSON.parse(fs.readFileSync(p, 'utf-8'));
const writeJson = (p, obj) => fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n', 'utf-8');

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

async function translateOne(q, source, target) {
  const body = { q, source, target, format: 'text' };
  const resp = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const data = await resp.json();
  return data.translatedText || q;
}

async function run() {
  if (!fs.existsSync(LOCALES_DIR)) fs.mkdirSync(LOCALES_DIR, { recursive: true });
  if (!fs.existsSync(CACHE_FILE)) writeJson(CACHE_FILE, {});

  const cache = readJson(CACHE_FILE);
  const enPath = path.join(LOCALES_DIR, 'en.json');
  const trPath = path.join(LOCALES_DIR, 'tr.json');

  if (!fs.existsSync(enPath)) {
    console.error('Missing base file locales/en.json');
    process.exit(1);
  }

  const base = readJson(enPath);
  const baseFlat = flatten(base);

  const targets = ['tr'];
  const chunkSize = 20;

  for (const target of targets) {
    const outFlat = {};
    const entries = Object.entries(baseFlat);

    for (let i = 0; i < entries.length; i += chunkSize) {
      const batch = entries.slice(i, i + chunkSize);
      for (const [key, value] of batch) {
        const cacheKey = `${key}|en|${target}|${value}`;
        if (cache[cacheKey]) {
          outFlat[key] = cache[cacheKey];
          continue;
        }
        try {
          const translated = await translateOne(value, 'en', target);
          outFlat[key] = translated;
          cache[cacheKey] = translated;
          console.log(`[${target}] ${key} -> ${translated}`);
        } catch (e) {
          console.warn(`Translate failed for ${key}: ${e}`);
          outFlat[key] = value; // fallback
        }
        await sleep(1000);
      }
    }

    const out = unflatten(outFlat);
    const outPath = target === 'tr' ? trPath : path.join(LOCALES_DIR, `${target}.json`);
    writeJson(outPath, out);
    writeJson(CACHE_FILE, cache);
  }

  console.log('Done');
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
