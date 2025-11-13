import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), '');

  // Determine API proxy target based on environment
  // In development, proxy to localhost if VITE_API_BASE_URL points to localhost
  // Otherwise, use the API base URL from environment
  const getApiProxyTarget = () => {
    const apiBaseUrl = env.VITE_API_BASE_URL || 'http://localhost:8080/api';
    
    // If API base URL is localhost, proxy to localhost
    if (apiBaseUrl.includes('localhost') || apiBaseUrl.includes('127.0.0.1')) {
      return 'http://localhost:8080';
    }
    
    // For production/cloud URLs, extract the base URL (remove /api suffix if present)
    try {
      const url = new URL(apiBaseUrl);
      return `${url.protocol}//${url.host}`;
    } catch {
      // Fallback to localhost if URL parsing fails
      return 'http://localhost:8080';
    }
  };

  // Determine Keycloak proxy target
  const getKeycloakProxyTarget = () => {
    const keycloakUrl = env.VITE_KEYCLOAK_URL || 'http://localhost:8180';
    
    // If Keycloak URL is localhost, proxy to localhost
    if (keycloakUrl.includes('localhost') || keycloakUrl.includes('127.0.0.1')) {
      return 'http://localhost:8180';
    }
    
    // For production/cloud URLs, use as-is
    try {
      const url = new URL(keycloakUrl);
      return `${url.protocol}//${url.host}`;
    } catch {
      return 'https://diam.dnext-pia.com';
    }
  };

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@pages': path.resolve(__dirname, './src/pages'),
        '@services': path.resolve(__dirname, './src/services'),
        '@utils': path.resolve(__dirname, './src/utils'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@store': path.resolve(__dirname, './src/store'),
        '@types': path.resolve(__dirname, './src/types'),
        '@assets': path.resolve(__dirname, './src/assets'),
        '@layouts': path.resolve(__dirname, './src/layouts'),
        '@config': path.resolve(__dirname, './src/config'),
      },
    },
    server: {
      port: 3000,
      proxy: {
        '/api': {
          target: getApiProxyTarget(),
          changeOrigin: true,
          secure: false,
          // Only proxy in development mode
          configure: (proxy, _options) => {
            // In production build, proxy is not used (static files served by nginx)
            // This proxy is only active during `npm run dev`
          },
        },
        '/keycloak': {
          target: getKeycloakProxyTarget(),
          changeOrigin: true,
          secure: true,
          rewrite: (path) => path.replace(/^\/keycloak/, ''),
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            mui: ['@mui/material', '@mui/icons-material'],
            utils: ['axios', 'date-fns', 'yup'],
          },
        },
      },
    },
  };
});
