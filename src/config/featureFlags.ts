export const AUTH_ENABLED: boolean =
  (import.meta.env.VITE_AUTH_ENABLED ?? 'true').toString().toLowerCase() === 'true';
