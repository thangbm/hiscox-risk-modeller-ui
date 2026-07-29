import { Outlet, NavLink } from 'react-router-dom';
import { Box } from '@mui/material';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import StorageOutlinedIcon from '@mui/icons-material/StorageOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import type { SvgIconComponent } from '@mui/icons-material';

const SIDEBAR_BG = '#0F1B2A';
const ACTIVE_BG = '#1565C0';
const ICON_COLOR = 'rgba(255, 255, 255, 0.60)';

interface NavItem {
  label: string;
  to: string;
  icon: SvgIconComponent;
  end?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { label: 'Home', to: '', icon: HomeOutlinedIcon, end: true },
  { label: 'Databases', to: 'data-import', icon: StorageOutlinedIcon },
  { label: 'Layers', to: 'layers', icon: LayersOutlinedIcon },
  { label: 'Analytics', to: 'analytics', icon: BarChartOutlinedIcon },
];

/**
 * Layout for the Risk Modeller remote. Renders a dark narrow icon-only sidebar
 * for in-module navigation and an Outlet for the active child route.
 */
export const Layout = () => (
  <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
    {/* Icon-only navigation sidebar */}
    <Box
      component="nav"
      aria-label="Module navigation"
      sx={{
        width: 52,
        flexShrink: 0,
        bgcolor: SIDEBAR_BG,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        pt: 1,
        gap: 0.5,
      }}
    >
      {NAV_ITEMS.map(({ label, to, icon: Icon, end }) => (
        <NavLink key={to} to={to} end={end} style={{ textDecoration: 'none', width: '100%' }}>
          {({ isActive }) => (
            <Box
              title={label}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                height: 44,
                mx: 0.5,
                borderRadius: 1,
                bgcolor: isActive ? ACTIVE_BG : 'transparent',
                color: isActive ? '#fff' : ICON_COLOR,
                transition: 'background-color 0.15s',
                '&:hover': {
                  bgcolor: isActive ? ACTIVE_BG : 'rgba(255, 255, 255, 0.07)',
                },
              }}
            >
              <Icon fontSize="small" />
            </Box>
          )}
        </NavLink>
      ))}
    </Box>

    {/* Active route content */}
    <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
      <Outlet />
    </Box>
  </Box>
);
