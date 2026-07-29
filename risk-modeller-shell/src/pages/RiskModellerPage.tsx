import { lazy, Suspense } from 'react';
import { CircularProgress, Box } from '@mui/material';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useAuth } from '@/auth/useAuth';

/**
 * Lazily import the federated remote component.
 * The string `'riskModeller/RiskModellerApp'` must match:
 *  - the `remotes.riskModeller` key in this shell's vite.config.ts, and
 *  - the `exposes['./RiskModellerApp']` entry in risk-modeller-ui's vite.config.ts.
 */
const RiskModellerApp = lazy(() => import('riskModeller/RiskModellerApp'));

function RemoteLoadingFallback() {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
      <CircularProgress />
    </Box>
  );
}

/**
 * Host page that mounts the risk-modeller-ui remote.
 *
 * The host provides:
 *  - BrowserRouter (via App.tsx)
 *  - MUI ThemeProvider (via App.tsx)
 *  - Suspense boundary (here)
 *  - ErrorBoundary (here) — isolates remote crashes from the rest of the shell
 *  - The MSAL-derived auth context, inherited by the remote via the
 *    `authContext` prop (see `useAuth` and `@/stubs/frontend-shared` in the
 *    remote) — this page is only reached once `RequireRole` has already
 *    confirmed the user is signed in.
 *
 * The remote (`RiskModellerApp`) owns its own React Query client and
 * sub-routes, which are relative to this mount point.
 */
export function RiskModellerPage() {
  const authContext = useAuth();

  return (
    <ErrorBoundary>
      <Suspense fallback={<RemoteLoadingFallback />}>
        <RiskModellerApp authContext={authContext} />
      </Suspense>
    </ErrorBoundary>
  );
}
