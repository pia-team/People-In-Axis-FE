/* Sentry initialization (optional). Will only run if VITE_SENTRY_DSN is set) */
import * as Sentry from '@sentry/react';

const DSN = import.meta.env.VITE_SENTRY_DSN as string | undefined;

if (DSN) {
  try {
    Sentry.init({
      dsn: DSN,
      environment: import.meta.env.MODE,
      release: (import.meta.env.VITE_RELEASE as string | undefined) || undefined,
      integrations: [],
      tracesSampleRate: 0.2,
    });
  } catch (e) {
    // eslint-disable-next-line no-console
    console.warn('Sentry init failed:', e);
  }
}
