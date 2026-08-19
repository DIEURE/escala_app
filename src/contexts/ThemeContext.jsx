import { createContext, useContext, useMemo, useState } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { createAppTheme } from '../app/theme';

const ThemeContext = createContext(null);

export function AppThemeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    return localStorage.getItem('themeMode') || 'light';
  });

  const theme = useMemo(() => createAppTheme(mode), [mode]);

  function toggleTheme() {
    setMode((currentMode) => {
      const nextMode = currentMode === 'light' ? 'dark' : 'light';

      localStorage.setItem('themeMode', nextMode);

      return nextMode;
    });
  }

  return (
    <ThemeContext.Provider value={{ mode, toggleTheme }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error(
      'useAppTheme deve ser utilizado dentro de AppThemeProvider.'
    );
  }

  return context;
}