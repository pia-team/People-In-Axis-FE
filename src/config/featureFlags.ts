export const AUTH_ENABLED: boolean =
  (import.meta.env.VITE_AUTH_ENABLED ?? 'false').toString().toLowerCase() === 'true';
