import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import type { PaletteMode } from '@mui/material';

// Central place to build theme for a given mode
const buildTheme = (mode: PaletteMode) => createTheme({
  palette: {
    mode,
    primary: {
      main: '#4F46E5',
      light: '#818CF8',
      dark: '#4338CA',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#06B6D4',
      light: '#67E8F9',
      dark: '#0E7490',
      contrastText: '#003041',
    },
    background: mode === 'dark'
      ? { default: '#0B1020', paper: '#0F1529' }
      : { default: '#F7F8FC', paper: '#FFFFFF' },
    text: mode === 'dark'
      ? { primary: '#E6E8F0', secondary: 'rgba(230,232,240,0.7)' }
      : { primary: 'rgba(0,0,0,0.87)', secondary: 'rgba(0,0,0,0.6)' },
    divider: mode === 'dark' ? 'rgba(230,232,240,0.12)' : 'rgba(0,0,0,0.12)'
  },
  shape: { borderRadius: 12 },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid',
          borderColor: 'divider',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0px 1px 3px rgba(0,0,0,0.12)',
          backgroundColor: mode === 'dark' ? '#0F1529' : '#FFFFFF',
          color: mode === 'dark' ? '#E6E8F0' : 'rgba(0,0,0,0.87)'
        },
      },
    },
  }
});

const STORAGE_KEY = 'theme_mode';

type ThemeModeContextType = {
  mode: PaletteMode;
  toggle: () => void;
  set: (m: PaletteMode) => void;
};

const ThemeModeContext = createContext<ThemeModeContextType | undefined>(undefined);

export const ThemeModeProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [mode, setMode] = useState<PaletteMode>(() => (localStorage.getItem(STORAGE_KEY) as PaletteMode) || 'light');

  const set = useCallback((m: PaletteMode) => {
    setMode(m);
    localStorage.setItem(STORAGE_KEY, m);
  }, []);

  const toggle = useCallback(() => set(mode === 'light' ? 'dark' : 'light'), [mode, set]);

  const theme = useMemo(() => buildTheme(mode), [mode]);

  const value = useMemo(() => ({ mode, toggle, set }), [mode, toggle, set]);

  return (
    <ThemeModeContext.Provider value={value}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeModeContext.Provider>
  );
};

export const useThemeMode = () => {
  const ctx = useContext(ThemeModeContext);
  if (!ctx) throw new Error('useThemeMode must be used within ThemeModeProvider');
  return ctx;
};
