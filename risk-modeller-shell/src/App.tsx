import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { theme } from '@re/frontend-shared';
import { Layout } from '@/components/Layout';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { HomePage } from '@/pages/HomePage';
import { RiskModellerPage } from '@/pages/RiskModellerPage';
import { AuthProvider } from '@/auth/AuthProvider';
import { RequireRole } from '@/auth/RequireRole';

/**
 * Root application component for the shell.
 *
 * The shell owns and provides to all remotes:
 *  - BrowserRouter — single source of truth for navigation
 *  - MUI ThemeProvider — shared Hiscox theme
 *  - AuthProvider — single MSAL instance/session for the whole app
 *  - Top-level ErrorBoundary — catches catastrophic failures
 *
 * Route structure:
 *  /               → HomePage (public)
 *  /risk-modeller/* → RiskModellerPage (federated remote, lazy-loaded, requires
 *                     sign-in + the Risk Modeller App Role — see RequireRole)
 */
export function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <BrowserRouter>
          <ErrorBoundary>
            <Layout>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route
                  path="/risk-modeller/*"
                  element={
                    <RequireRole>
                      <RiskModellerPage />
                    </RequireRole>
                  }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </Layout>
          </ErrorBoundary>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
