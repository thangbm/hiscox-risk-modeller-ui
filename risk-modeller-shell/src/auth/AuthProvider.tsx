import type { ReactNode } from 'react';
import { MsalProvider } from '@azure/msal-react';
import { msalInstance } from './msalInstance';

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Wraps the app in the MSAL React context, built from the single MSAL
 * instance initialised in `main.tsx`.
 */
export function AuthProvider({ children }: AuthProviderProps) {
  return <MsalProvider instance={msalInstance}>{children}</MsalProvider>;
}
