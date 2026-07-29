import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MsalProvider } from '@azure/msal-react';
import { fakeMsalInstance } from '@/auth/fakeMsalInstance';
import { requiredRiskModellerRole } from '@/auth/msalConfig';
import { RequireAuth } from '@/auth/RequireAuth';
import { RequireRole } from '@/auth/RequireRole';
import { useAuth } from '@/auth/useAuth';

/**
 * Exercises the real `MsalProvider` + `RequireAuth`/`RequireRole`/`useAuth`
 * against `fakeMsalInstance`, confirming the fake satisfies everything
 * `@azure/msal-react` needs (accounts, logger, event callbacks) without any
 * component-level branching for "fake mode".
 */
describe('fakeMsalInstance', () => {
  it('reports an already-authenticated fake account holding the required role', async () => {
    render(
      <MsalProvider instance={fakeMsalInstance}>
        <RequireRole requiredRole={requiredRiskModellerRole}>
          <div>Risk Modeller</div>
        </RequireRole>
      </MsalProvider>,
    );

    expect(await screen.findByText('Risk Modeller')).toBeInTheDocument();
  });

  it('renders protected content via RequireAuth with no redirect', async () => {
    render(
      <MsalProvider instance={fakeMsalInstance}>
        <RequireAuth>
          <div>Protected</div>
        </RequireAuth>
      </MsalProvider>,
    );

    expect(await screen.findByText('Protected')).toBeInTheDocument();
  });

  it('exposes the fake user name and access token via useAuth', async () => {
    function Probe() {
      const { userName } = useAuth();
      return <div>{userName}</div>;
    }

    render(
      <MsalProvider instance={fakeMsalInstance}>
        <Probe />
      </MsalProvider>,
    );

    expect(await screen.findByText('Local Dev User (mock auth)')).toBeInTheDocument();

    const token = await fakeMsalInstance.acquireTokenSilent({ scopes: ['openid'] });
    expect(token.accessToken).toBe('mock-access-token');
  });
});
