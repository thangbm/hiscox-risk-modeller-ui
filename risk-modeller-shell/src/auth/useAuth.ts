import { useMemo } from 'react';
import { InteractionRequiredAuthError } from '@azure/msal-browser';
import { useAccount, useMsal } from '@azure/msal-react';
import { loginRequest } from './msalConfig';

export interface AuthContextValue {
  /** Display name of the authenticated user, if any. */
  userName: string | null;
  /** Entra App Roles present on the signed-in account's ID token. */
  roles: string[];
  /** Whether an account is currently signed in. */
  isAuthenticated: boolean;
  /** Returns the current access token, acquiring one silently (or interactively if required). */
  getAccessToken: () => Promise<string | null>;
}

/**
 * Reads the active MSAL account and exposes auth state/token acquisition in
 * the shape the future `@re/frontend-shared` context is expected to provide.
 * Memoised so the returned object is referentially stable across renders —
 * it is also passed as a prop into the federated `RiskModellerApp` remote
 * (see RiskModellerPage.tsx), where instability would cause needless re-renders.
 * See: ../../.ai/docs/RE-Frontend-Shared.md
 */
export function useAuth(): AuthContextValue {
  const { instance } = useMsal();
  const account = useAccount();

  return useMemo<AuthContextValue>(() => {
    const roles = (account?.idTokenClaims?.roles as string[] | undefined) ?? [];

    const getAccessToken = async (): Promise<string | null> => {
      if (!account) {
        return null;
      }
      try {
        const result = await instance.acquireTokenSilent({ ...loginRequest, account });
        return result.accessToken;
      } catch (error) {
        if (error instanceof InteractionRequiredAuthError) {
          await instance.acquireTokenRedirect({ ...loginRequest, account });
        }
        return null;
      }
    };

    return {
      userName: account?.name ?? null,
      roles,
      isAuthenticated: Boolean(account),
      getAccessToken,
    };
  }, [account, instance]);
}
