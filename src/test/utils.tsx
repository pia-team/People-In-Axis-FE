import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { renderHook as rtlRenderHook, RenderHookOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { SnackbarProvider } from 'notistack';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { store } from '@/store';

const theme = createTheme();

interface AllTheProvidersProps {
  children: React.ReactNode;
}

const AllTheProviders: React.FC<AllTheProvidersProps> = ({ children }) => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
    },
  });

  return (
    <QueryClientProvider client={queryClient}>
      <Provider store={store}>
        <BrowserRouter>
          <ThemeProvider theme={theme}>
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <SnackbarProvider>
                {children}
              </SnackbarProvider>
            </LocalizationProvider>
          </ThemeProvider>
        </BrowserRouter>
      </Provider>
    </QueryClientProvider>
  );
};

const customRender = (
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) => render(ui, { wrapper: AllTheProviders, ...options });

const customRenderHook = <T,>(
  hook: () => T,
  options?: Omit<RenderHookOptions<T>, 'wrapper'>
) => rtlRenderHook(hook, { wrapper: AllTheProviders, ...options });

export * from '@testing-library/react';
export { fireEvent } from '@testing-library/react';
export { customRender as render, customRenderHook as renderHook };
