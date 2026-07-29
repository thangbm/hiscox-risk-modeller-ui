import { useMemo } from 'react';
import { Alert, Box, Divider, IconButton, Stack, Typography } from '@mui/material';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Button, InlineLoading } from '@re/frontend-shared';
import { DatabaseSearchBar } from '@/features/data-import/components/DatabaseSearchBar';
import { ExistingDatabaseList } from '@/features/data-import/components/ExistingDatabaseList';
import { useRegisteredDatabases } from '@/features/data-import/hooks/useRegisteredDatabases';
import { useDataImportStore } from '@/features/data-import/stores/useDataImportStore';
import { filterDatabases } from '@/features/data-import/utils/filterDatabases';

const PANEL_WIDTH = 320;

/**
 * Inline collapsible panel that lists the databases already registered with
 * Data Bridge. Replaces the slide-out Drawer; sits flush with the page left
 * edge inside the DataImportPage layout.
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
          width: 24,
          flexShrink: 0,
          borderRight: 1,
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'flex-start',
          pt: 0.5,
        }}
      >
        <IconButton
          size="small"
          aria-label="Expand Existing Databases"
          onClick={toggleDrawer}
          sx={{ borderRadius: 0 }}
        >
          <ChevronRightIcon fontSize="small" />
        </IconButton>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: PANEL_WIDTH,
        flexShrink: 0,
        borderRight: 1,
        borderColor: 'divider',
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <Stack
        direction="row"
        alignItems="flex-start"
        justifyContent="space-between"
        sx={{ p: 2, pb: 1.5 }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="subtitle1" fontWeight="medium">
            Existing Databases
          </Typography>
          <Typography variant="caption" color="text.secondary">
            All databases attached to Data Bridge and registered for Risk Modeller.
          </Typography>
        </Box>
        <Stack direction="row" alignItems="center" sx={{ flexShrink: 0, ml: 1, mt: -0.5 }}>
          <IconButton
            size="small"
            aria-label="Refresh databases"
            disabled={isFetching}
            onClick={() => void refetch()}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" aria-label="Collapse panel" onClick={toggleDrawer}>
            <ChevronLeftIcon fontSize="small" />
          </IconButton>
        </Stack>
      </Stack>

      <Divider />

      <Box sx={{ flex: 1, overflow: 'auto', p: 2 }}>
        {isLoading && <InlineLoading message="Loading databases" />}

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
          <Stack spacing={1}>
            <DatabaseSearchBar
              query={searchQuery}
              matchMode={matchMode}
              resultCount={filteredDatabases.length}
              totalCount={databases.length}
              onQueryChange={setSearchQuery}
              onMatchModeChange={setMatchMode}
              onClear={clearSearch}
            />
            <ExistingDatabaseList
              databases={filteredDatabases}
              emptyMessage={
                databases.length === 0
                  ? 'No registered databases found.'
                  : 'No databases match your search.'
              }
            />
            {databases.length > 0 && filteredDatabases.length === 0 && (
              <Button
                tier="tertiary"
                size="small"
                onClick={clearSearch}
                sx={{ alignSelf: 'flex-start' }}
              >
                Clear search
              </Button>
            )}
          </Stack>
        )}
      </Box>
    </Box>
  );
};
