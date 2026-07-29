import { useEffect, type ReactNode } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { InteractionStatus } from '@azure/msal-browser';
import { useIsAuthenticated, useMsal } from '@azure/msal-react';
import { loginRequest } from './msalConfig';

interface RequireAuthProps {
  children: ReactNode;
}

/**
 * Gates its children behind Entra ID sign-in. Redirects to the Entra login
 * page when no account is signed in, and renders a spinner while that
 * redirect / the return-trip interaction is in progress.
 */
export function RequireAuth({ children }: RequireAuthProps) {
  const isAuthenticated = useIsAuthenticated();
  const { instance, inProgress } = useMsal();

  useEffect(() => {
    if (!isAuthenticated && inProgress === InteractionStatus.None) {
      void instance.loginRedirect(loginRequest);
    }
  }, [isAuthenticated, inProgress, instance]);

  if (!isAuthenticated) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return <>{children}</>;
}
