import { createTheme } from '@mui/material/styles';

export function createAppTheme(mode = 'light') {
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary: {
        main: isDark ? '#eb6003' : '#0084ff',
      },
      secondary: {
        main: '#7F56D9',
      },
      success: {
        main: '#12B76A',
      },
      warning: {
        main: '#eb6003',
      },
      error: {
        main: '#ff1100',
      },
      background: {
        default: isDark ? '#101828' : '#F8FAFC',
        paper: isDark ? '#1D2939' : '#FFFFFF',
      },
      text: {
        primary: isDark ? '#f19408' : '#1D2939',
        secondary: isDark ? '#98A2B3' : '#667085',
      },
      divider: isDark ? '#344054' : '#EAECF0',
    },

    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 700 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 700 },
      h6: { fontWeight: 700 },
      button: {
        textTransform: 'none',
        fontWeight: 600,
      },
    },

    shape: {
      borderRadius: 12,
    },

    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            margin: 0,
            minWidth: 320,
          },
        },
      },

      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },

      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            padding: '10px 16px',
            boxShadow: 'none',
          },
          contained: {
            '&:hover': {
              boxShadow: 'none',
            },
          },
        },
      },

      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
    },
  });
}