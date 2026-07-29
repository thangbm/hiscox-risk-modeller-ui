import type { ReactNode } from 'react';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter } from 'react-router-dom';
import { theme } from '@re/frontend-shared';

/**
 * Root providers for STANDALONE development only.
 *
 * In the federated app these are supplied by the HOST (Rehub): the shared MUI
 * theme and the Router live in the shell. The MSAL-derived auth context is
 * also owned by the host, but is bridged into this remote via a prop on
 * `RiskModellerApp` rather than here (see RiskModellerApp.tsx), so `useAuth()`
 * works the same in both standalone and federated mode.
 */
export const AppProvider = ({ children }: { children: ReactNode }) => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <BrowserRouter>{children}</BrowserRouter>
  </ThemeProvider>
);
