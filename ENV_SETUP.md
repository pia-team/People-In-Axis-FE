# Environment Configuration Guide

## 📁 Environment Files Structure

### Files Overview

| File | Purpose | Git Status | When Used |
|------|---------|------------|-----------|
| `.env.example` | Template file with default values | ✅ Tracked | Reference only |
| `.env.local` | Local development overrides | ❌ Ignored | `npm run dev` |
| `.env.production` | Production build values | ✅ Tracked | `npm run build` |

### ❌ Files to Avoid

- **`.env`** - **DO NOT USE** - Redundant, conflicts with `.env.local` and `.env.production`
- **`.env.development`** - Optional, not needed if using `.env.local`

## 🔄 How Vite Loads Environment Files

### Development Mode (`npm run dev`)

Vite loads environment files in this order (higher priority first):

1. `.env.development.local` (if exists, ignored by git)
2. **`.env.local`** ✅ **PRIMARY** (ignored by git)
3. `.env.development` (if exists, tracked by git)

**Result:** `.env.local` is used for local development.

### Production Mode (`npm run build`)

Vite loads environment files in this order (higher priority first):

1. `.env.production.local` (if exists, ignored by git)
2. `.env.local` (if exists, but production values override it)
3. **`.env.production`** ✅ **PRIMARY** (tracked by git)
4. `.env` (if exists, tracked by git - **avoid using**)

**Result:** `.env.production` is used for production builds.

## 🚀 Quick Start

### Local Development Setup

1. Copy the template:
   ```bash
   cp .env.example .env.local
   ```

2. Edit `.env.local` with your local values:
   ```env
   VITE_API_BASE_URL=http://localhost:8080/api
   VITE_KEYCLOAK_URL=https://diam.dnext-pia.com
   # ... other values
   ```

3. Start dev server:
   ```bash
   npm run dev
   ```

### Production Build

No action needed! `.env.production` is already configured with production values.

```bash
npm run build
```

## 📝 Current Configuration

### Local Development (`.env.local`)
- **API**: `http://localhost:8080/api` (local backend)
- **Keycloak**: `https://diam.dnext-pia.com` (production Keycloak)
- **UI**: `http://localhost:3000`

### Production Build (`.env.production`)
- **API**: `https://people-in-axis-api.dnext-pia.com/api`
- **Keycloak**: `https://diam.dnext-pia.com`
- **UI**: `https://people-in-axis-ui.dnext-pia.com`

## ⚙️ vite.config.ts Behavior

The `vite.config.ts` automatically detects the environment:

- **If `VITE_API_BASE_URL` contains `localhost`**: Proxy to `http://localhost:8080`
- **If `VITE_API_BASE_URL` is production URL**: Proxy to production API
- **Same logic applies to Keycloak URL**

This ensures the proxy works correctly in both local and production-like development scenarios.

## ✅ Best Practices

1. ✅ **Use `.env.local`** for local development
2. ✅ **Use `.env.production`** for production builds
3. ✅ **Keep `.env.example`** as a template
4. ❌ **Don't use `.env`** - it's redundant and can cause confusion
5. ✅ **Restart dev server** after changing `.env.local`
6. ✅ **Never commit `.env.local`** (already in `.gitignore`)

## 🔍 Troubleshooting

### API calls going to wrong URL

1. Check which file is being used:
   - Development: Check `.env.local`
   - Production: Check `.env.production`

2. Restart dev server after changing `.env.local`:
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

3. Verify environment variable in browser console:
   ```javascript
   console.log(import.meta.env.VITE_API_BASE_URL)
   ```

### Keycloak authentication issues

- Check `VITE_KEYCLOAK_URL` in `.env.local`
- Ensure Keycloak server is accessible
- Verify realm and client ID are correct


