import { useEffect, type ReactNode } from 'react';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '@/app/queryClient';
import { ErrorBoundary } from '@/app/error-boundary';
import { AppRoutes } from '@/app/router';
import { AuthProvider, useAuth, type AuthContextValue } from '@/stubs/frontend-shared';
import { setAuthTokenAccessor } from '@/utils/apiClient';

export interface RiskModellerAppProps {
  /**
   * Auth context inherited from the host's single MSAL instance, passed down
   * as a prop at the federation boundary (risk-modeller-shell computes this
   * via its own `useAuth()` and forwards it here — see RiskModellerPage.tsx
   * in the shell). Undefined in standalone dev, where `AuthProvider` falls
   * back to a local stub value.
   */
  authContext?: AuthContextValue;
}

/**
 * Holds the currently-active `getAccessToken`. Kept in sync by
 * `ApiAuthInterceptor` (via effect, after render); read lazily by the
 * accessor bound into `apiClient` below.
 */
const getAccessTokenRef: { current: () => Promise<string | null> } = {
  current: () => Promise.resolve(null),
};

/**
 * One-time binding into `apiClient` (see @/utils/apiClient), done once at
 * module load rather than in a React effect. This makes it independent of
 * any component's mount/unmount lifecycle — it's never re-registered or
 * cleared, it always just delegates to whatever `getAccessTokenRef.current`
 * currently points to.
 */
setAuthTokenAccessor(() => getAccessTokenRef.current());

/**
 * Keeps `getAccessTokenRef` pointed at the current auth context's
 * `getAccessToken`. No cleanup: unmounting must not clear it (that would
 * leave `apiClient` unauthenticated), it should simply stop being updated.
 * Must render inside `AuthProvider`.
 */
function ApiAuthInterceptor({ children }: { children: ReactNode }) {
  const { getAccessToken } = useAuth();

  useEffect(() => {
    getAccessTokenRef.current = getAccessToken;
  }, [getAccessToken]);

  return <>{children}</>;
}

/**
 * FEDERATION ENTRY POINT — exposed as `riskModeller/RiskModellerApp`.
 *
 * This is the PUBLIC API of the remote (see Micro-Frontend-Architecture.md):
 * renaming or removing it breaks the host's lazy import at runtime.
 *
 * Contract with the host (Rehub):
 *  - The host provides the Router and the shared MUI ThemeProvider, and
 *    already wraps this in Suspense + ErrorBoundary.
 *  - The host's MSAL auth context is bridged in via the `authContext` prop
 *    (see `AuthProvider` in `@/stubs/frontend-shared`).
 *  - This component otherwise owns ONLY what is local to the remote: its
 *    React Query client and its nested routes. The internal ErrorBoundary is
 *    defensive.
 */
const RiskModellerApp = ({ authContext }: RiskModellerAppProps) => (
  <ErrorBoundary>
    <AuthProvider value={authContext}>
      <ApiAuthInterceptor>
        <QueryClientProvider client={queryClient}>
          <AppRoutes />
        </QueryClientProvider>
      </ApiAuthInterceptor>
    </AuthProvider>
  </ErrorBoundary>
);

export default RiskModellerApp;
