/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  readonly VITE_KEYCLOAK_URL: string
  readonly VITE_KEYCLOAK_REALM: string
  readonly VITE_KEYCLOAK_CLIENT_ID: string
  readonly VITE_AUTH_ENABLED?: string
  readonly VITE_KEYCLOAK_REDIRECT_URI?: string
  readonly VITE_KEYCLOAK_REDIRECT_PATH?: string
  readonly VITE_SENTRY_DSN?: string
  readonly VITE_RELEASE?: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
