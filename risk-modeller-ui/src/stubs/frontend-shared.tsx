/* =============================================================================
 * LOCAL STUB — TEMPORARY
 * -----------------------------------------------------------------------------
 * This module stands in for the unpublished `@re/frontend-shared` package and
 * the shared MSAL auth context it will provide (see .ai/docs/RE-Frontend-Shared.md
 * and Micro-Frontend-Architecture.md).
 *
 * It deliberately mirrors the FUTURE public surface so that, once the package is
 * published, removing this file and changing imports from
 *   '@/stubs/frontend-shared'  ->  '@re/frontend-shared'
 * is the only change required. Do NOT add app-specific logic here.
 *
 * In production:
 *  - `theme` comes from the shared design system.
 *  - `AuthProvider` / `useAuth` are provided by the HOST (Rehub); remotes only
 *    CONSUME the context and never initialise their own MSAL instance.
 * ========================================================================== */

import { createContext, useContext, useMemo, type ReactNode } from 'react';
import { createTheme, type Theme } from '@mui/material/styles';

/** Stand-in for the shared MUI theme. Mirrors the documented design tokens. */
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

/** Auth context shape the real shared library is expected to expose. */
export interface AuthContextValue {
  /** Display name of the authenticated user, if any. */
  userName: string | null;
  /** Entra App Roles present on the signed-in account's ID token. */
  roles: string[];
  /** Whether an account is currently signed in. */
  isAuthenticated: boolean;
  /** Returns the current access token (null when unauthenticated). */
  getAccessToken: () => Promise<string | null>;
}

const StubAuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
  /**
   * Real auth context INHERITED FROM THE HOST, passed down as a prop at the
   * federation boundary (see `RiskModellerApp.tsx`). This is an interim bridge:
   * host and remote are separate Module Federation bundles and can't share a
   * literal React Context object without the real `@re/frontend-shared`
   * package (which would be declared `shared` in both `vite.config.ts`s).
   * Undefined in standalone dev, where a fake dev value is used instead.
   */
  value?: AuthContextValue;
}

/**
 * STUB provider. In standalone dev (no `value`) it yields a fake signed-in
 * user so the remote runs alone. In the federated app it re-provides the
 * value the host injected into `RiskModellerApp`, so `useAuth()` behaves
 * identically either way for every consumer inside this remote.
 */
export const AuthProvider = ({ children, value }: AuthProviderProps) => {
  const standaloneValue = useMemo<AuthContextValue>(
    () => ({
      userName: 'Local Dev User',
      roles: [],
      isAuthenticated: true,
      getAccessToken: async () => 'stub-access-token',
    }),
    [],
  );
  return (
    <StubAuthContext.Provider value={value ?? standaloneValue}>
      {children}
    </StubAuthContext.Provider>
  );
};

/** Consume the auth context. Matches the intended shared-library hook. */
export const useAuth = (): AuthContextValue => {
  const ctx = useContext(StubAuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
};
