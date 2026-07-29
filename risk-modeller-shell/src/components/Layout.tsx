import type { ReactNode } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  AppBar,
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Toolbar,
  Typography,
  CssBaseline,
} from '@mui/material';
import { Button } from '@re/frontend-shared';
import { AuthenticatedTemplate, useMsal } from '@azure/msal-react';
import { useAuth } from '@/auth/useAuth';

const DRAWER_WIDTH = 220;

const NAV_ITEMS = [
  { label: 'Home', path: '/' },
  { label: 'Risk Modeller', path: '/risk-modeller' },
];

interface LayoutProps {
  children: ReactNode;
}

/**
 * Shell chrome: fixed AppBar + left-side navigation drawer.
 * The host Router owns the navigation; the remote mounts inside `children`.
 */
export function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const { instance } = useMsal();
  const { userName } = useAuth();

  const handleSignOut = () => {
    void instance.logoutRedirect({
      postLogoutRedirectUri: import.meta.env.VITE_AZURE_AD_POST_LOGOUT_REDIRECT_URI ?? window.location.origin,
    });
  };

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />

      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Typography variant="h6" noWrap component="div">
            Risk Modeller Shell
          </Typography>
          <AuthenticatedTemplate>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" noWrap>
                {userName}
              </Typography>
              <Button tier='tertiary' onClick={handleSignOut}>
                Sign out
              </Button>
            </Box>
          </AuthenticatedTemplate>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <List disablePadding>
          {NAV_ITEMS.map(({ label, path }) => (
            <ListItem key={path} disablePadding>
              <ListItemButton
                component={NavLink}
                to={path}
                selected={
                  path === '/'
                    ? location.pathname === '/'
                    : location.pathname.startsWith(path)
                }
              >
                <ListItemText primary={label} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>

      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}
