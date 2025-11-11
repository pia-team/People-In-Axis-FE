import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { BrowserRouter } from 'react-router-dom';
import { ThemeModeProvider } from './providers/ThemeModeProvider';
import CssBaseline from '@mui/material/CssBaseline';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { SnackbarProvider } from 'notistack';

import App from './App';
import { store } from './store';
// theme is provided by ThemeModeProvider
import { KeycloakProvider } from './providers/KeycloakProvider';
import './sentry';
import GlobalErrorBoundary from '@/components/GlobalErrorBoundary';
import SnackbarConfigurator from '@/components/SnackbarConfigurator';
import './i18n';
import './index.css';

// Create a query client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: (failureCount, error: any) => {
        const status = error?.response?.status;
        if (status && status < 500) return false;
        return failureCount < 1;
      },
      refetchOnWindowFocus: false,
    },
  },
});

const RootTree = (
  <Provider store={store}>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ThemeModeProvider>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <CssBaseline />
            <SnackbarProvider
              maxSnack={3}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              autoHideDuration={3000}
            >
              <SnackbarConfigurator />
              <KeycloakProvider>
                <GlobalErrorBoundary>
                  <App />
                </GlobalErrorBoundary>
              </KeycloakProvider>
            </SnackbarProvider>
          </LocalizationProvider>
        </ThemeModeProvider>
      </BrowserRouter>
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  </Provider>
);

const enableStrictMode = String(import.meta.env.VITE_ENABLE_STRICT_MODE || 'false').toLowerCase() === 'true';

ReactDOM.createRoot(document.getElementById('root')!).render(
  enableStrictMode ? <React.StrictMode>{RootTree}</React.StrictMode> : RootTree
);
