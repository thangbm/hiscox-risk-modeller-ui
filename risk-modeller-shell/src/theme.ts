import { createTheme, type Theme } from '@mui/material/styles';

/**
 * Shell theme — mirrors the shared Hiscox design tokens.
 * In production this would be imported from `@re/frontend-shared`.
 */
export const theme: Theme = createTheme({
  palette: {
    primary: { main: '#DA291C' },
    background: { default: '#F3F6F8', paper: '#FFFFFF' },
  },
  typography: {
    fontFamily: '"Helvetica Neue", Arial, sans-serif',
    fontSize: 14,
  },
});
