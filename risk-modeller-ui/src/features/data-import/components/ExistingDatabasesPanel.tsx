import { useMemo } from 'react';
import { Alert, Box, CircularProgress, Divider, IconButton, Stack, Typography } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Button } from '@re/frontend-shared';
import { DatabaseSearchBar } from '@/features/data-import/components/DatabaseSearchBar';
import { ExistingDatabaseList } from '@/features/data-import/components/ExistingDatabaseList';
import { useRegisteredDatabases } from '@/features/data-import/hooks/useRegisteredDatabases';
import { useDataImportStore } from '@/features/data-import/stores/useDataImportStore';
import { filterDatabases } from '@/features/data-import/utils/filterDatabases';

const PANEL_WIDTH = 320;
const PANEL_BG = '#1B2A3B';
const BORDER_COLOR = 'rgba(255, 255, 255, 0.08)';

const darkPanelTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#1565C0' },
    success: { main: '#4CAF50' },
    background: { default: PANEL_BG, paper: PANEL_BG },
  },
  typography: { fontFamily: '"Helvetica Neue", Arial, sans-serif', fontSize: 14 },
});

/**
 * Inline collapsible panel that lists the databases already registered with
 * Data Bridge. Dark-themed; sits flush with the icon sidebar inside the
 * DataImportPage layout.
 */
export const ExistingDatabasesPanel = () => {
  const isOpen = useDataImportStore((state) => state.isDrawerOpen);
  const toggleDrawer = useDataImportStore((state) => state.toggleDrawer);
  const searchQuery = useDataImportStore((state) => state.searchQuery);
  const setSearchQuery = useDataImportStore((state) => state.setSearchQuery);
  const clearSearch = useDataImportStore((state) => state.clearSearch);
  const matchMode = useDataImportStore((state) => state.matchMode);
  const setMatchMode = useDataImportStore((state) => state.setMatchMode);

  const { data, isLoading, isFetching, error, refetch } = useRegisteredDatabases();

  const databases = useMemo(() => data?.databases ?? [], [data]);
  const filteredDatabases = useMemo(
    () => filterDatabases(databases, searchQuery, matchMode),
    [databases, searchQuery, matchMode],
  );

  if (!isOpen) {
    return (
      <Box
        sx={{
          width: 20,
          flexShrink: 0,
          bgcolor: PANEL_BG,
          borderRight: `1px solid ${BORDER_COLOR}`,
          display: 'flex',
          alignItems: 'flex-start',
          pt: 0.5,
        }}
      >
        <IconButton
          size="small"
          aria-label="Expand Existing Databases"
          onClick={toggleDrawer}
          sx={{ color: 'rgba(255,255,255,0.55)', p: 0, borderRadius: 0 }}
        >
          <KeyboardDoubleArrowRightIcon fontSize="small" />
        </IconButton>
      </Box>
    );
  }

  return (
    <ThemeProvider theme={darkPanelTheme}>
      <Box
        sx={{
          width: PANEL_WIDTH,
          flexShrink: 0,
          bgcolor: 'background.default',
          borderRight: `1px solid ${BORDER_COLOR}`,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* ── Panel header ── */}
        <Stack
          direction="row"
          alignItems="flex-start"
          justifyContent="space-between"
          sx={{ px: 2, pt: 2, pb: 1.5 }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
              Existing Databases
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.4 }}>
              All databases attached to Data Bridge and registered for Risk Modeller.
            </Typography>
          </Box>
          <IconButton
            size="small"
            aria-label="Collapse panel"
            onClick={toggleDrawer}
            sx={{ color: 'text.secondary', flexShrink: 0, mt: -0.5, ml: 0.5 }}
          >
            <KeyboardDoubleArrowLeftIcon fontSize="small" />
          </IconButton>
        </Stack>

        <Divider sx={{ borderColor: BORDER_COLOR }} />

        {/* ── Source filter row ── */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ px: 2, py: 1 }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
            Registered Databases (Data Bridge Source)
          </Typography>
          <Box
            sx={{
              border: '1px solid',
              borderColor: isFetching ? 'warning.main' : 'rgba(255,255,255,0.22)',
              borderRadius: 0.75,
              width: 28,
              height: 28,
              flexShrink: 0,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconButton
              size="small"
              aria-label="Refresh databases"
              disabled={isFetching}
              onClick={() => void refetch()}
              sx={{
                p: 0,
                color: isFetching ? 'warning.main' : 'text.secondary',
                '&:hover': { bgcolor: 'transparent', color: 'text.primary' },
              }}
            >
              {isFetching ? (
                <CircularProgress size={14} color="warning" />
              ) : (
                <RefreshIcon sx={{ fontSize: 16 }} />
              )}
            </IconButton>
          </Box>
        </Stack>

        <Divider sx={{ borderColor: BORDER_COLOR }} />

        {/* ── Search + list ── */}
        <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
          {isLoading && (
            <Stack direction="row" alignItems="center" spacing={1} sx={{ py: 1 }}>
              <CircularProgress size={14} />
              <Typography variant="caption" color="text.secondary">
                Loading databases…
              </Typography>
            </Stack>
          )}

          {!isLoading && error && (
            <Alert
              severity="error"
              action={
                <Button tier="tertiary" size="small" onClick={() => void refetch()}>
                  Retry
                </Button>
              }
            >
              Failed to load the registered databases.
            </Alert>
          )}

          {!isLoading && !error && (
            <DatabaseSearchBar
              query={searchQuery}
              matchMode={matchMode}
              resultCount={filteredDatabases.length}
              totalCount={databases.length}
              onQueryChange={setSearchQuery}
              onMatchModeChange={setMatchMode}
              onClear={clearSearch}
            />
          )}
        </Box>

        {!isLoading && !error && (
          <Box sx={{ flex: 1, overflow: 'auto' }}>
            <ExistingDatabaseList
              databases={filteredDatabases}
              emptyMessage={
                databases.length === 0
                  ? 'No registered databases found.'
                  : 'No databases match your search.'
              }
            />
          </Box>
        )}
      </Box>
    </ThemeProvider>
  );
};
