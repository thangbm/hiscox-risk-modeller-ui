import { Outlet, NavLink } from 'react-router-dom';
import { Box, Typography } from '@mui/material';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import TuneIcon from '@mui/icons-material/Tune';

const NAV_ITEMS = [
  { label: 'Home', to: '', icon: HomeOutlinedIcon, end: true },
  { label: 'Databases', to: 'data-import', icon: StorageOutlinedIcon, end: false },
] as const;

/**
 * Layout for the Risk Modeller remote. Renders a narrow icon sidebar for
 * in-module navigation (Home, Databases, Options) and an Outlet for the
 * active child route.
 */
export const Layout = () => (
  <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
    {/* Icon navigation sidebar */}
    <Box
      component="nav"
      aria-label="Module navigation"
      sx={{
        width: 72,
        flexShrink: 0,
        borderRight: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        py: 1,
      }}
    >
      <Box sx={{ flex: 1 }}>
        {NAV_ITEMS.map(({ label, to, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end} style={{ textDecoration: 'none' }}>
            {({ isActive }) => (
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  py: 1.5,
                  px: 0.5,
                  mx: 0.5,
                  borderRadius: 1,
                  bgcolor: isActive ? 'primary.main' : 'transparent',
                  color: isActive ? 'primary.contrastText' : 'text.secondary',
                  transition: 'background-color 0.15s',
                  '&:hover': {
                    bgcolor: isActive ? 'primary.dark' : 'action.hover',
                  },
                }}
              >
                <Icon fontSize="small" />
                <Typography
                  variant="caption"
                  sx={{ mt: 0.5, lineHeight: 1.2, fontSize: '0.65rem', textAlign: 'center' }}
                >
                  {label}
                </Typography>
              </Box>
            )}
          </NavLink>
        ))}
      </Box>

      {/* Options at the bottom */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          py: 1.5,
          px: 0.5,
          mx: 0.5,
          mb: 1,
          borderRadius: 1,
          color: 'text.secondary',
          cursor: 'default',
          '&:hover': { bgcolor: 'action.hover' },
        }}
      >
        <TuneIcon fontSize="small" />
        <Typography
          variant="caption"
          sx={{ mt: 0.5, lineHeight: 1.2, fontSize: '0.65rem', textAlign: 'center' }}
        >
          Options
        </Typography>
      </Box>
    </Box>

    {/* Active route content */}
    <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
      <Outlet />
    </Box>
  </Box>
);
