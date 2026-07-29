import type { ReactNode } from 'react';
import { Alert, Box } from '@mui/material';
import { RequireAuth } from './RequireAuth';
import { requiredRiskModellerRole } from './msalConfig';
import { useAuth } from './useAuth';

interface RequireRoleProps {
  children: ReactNode;
  /** Defaults to the Risk Modeller App Role configured via env. */
  requiredRole?: string;
}

/**
 * Gates its children behind sign-in (via `RequireAuth`) AND possession of the
 * given Entra App Role. Renders a 403-style message when the signed-in
 * account lacks the role.
 */
export function RequireRole({ children, requiredRole = requiredRiskModellerRole }: RequireRoleProps) {
  return (
    <RequireAuth>
      <RoleCheck requiredRole={requiredRole}>{children}</RoleCheck>
    </RequireAuth>
  );
}

function RoleCheck({ children, requiredRole }: { children: ReactNode; requiredRole: string }) {
  const { roles } = useAuth();

  if (!roles.includes(requiredRole)) {
    return (
      <Box sx={{ pt: 4 }}>
        <Alert severity="error">
          You do not have the required role (&quot;{requiredRole}&quot;) to access this page.
        </Alert>
      </Box>
    );
  }

  return <>{children}</>;
}
