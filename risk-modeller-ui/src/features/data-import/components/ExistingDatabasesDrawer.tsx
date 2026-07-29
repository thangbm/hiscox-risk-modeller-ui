import { useMemo } from 'react';
import { Alert, Box, Drawer, IconButton, Stack, Typography } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import RefreshIcon from '@mui/icons-material/Refresh';
import { Button, InlineLoading } from '@re/frontend-shared';
import { DatabaseSearchBar } from '@/features/data-import/components/DatabaseSearchBar';
import { ExistingDatabaseList } from '@/features/data-import/components/ExistingDatabaseList';
import { useRegisteredDatabases } from '@/features/data-import/hooks/useRegisteredDatabases';
import { useDataImportStore } from '@/features/data-import/stores/useDataImportStore';
import { filterDatabases } from '@/features/data-import/utils/filterDatabases';

const DRAWER_WIDTH = { xs: '100%', sm: 420, md: 540 };

/**
 * Slide-out drawer listing the databases attached to Data Bridge that are
 * registered for Risk Modeller. Read-only: search, refresh, nothing else.
 */
export const ExistingDatabasesDrawer = () => {
  const isDrawerOpen = useDataImportStore((state) => state.isDrawerOpen);
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

  return (
    <Drawer
      anchor="left"
      open={isDrawerOpen}
      onClose={toggleDrawer}
      sx={{ '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box', p: 2 } }}
    >
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
        <Box>
          <Typography variant="h6" component="h2">
            Existing Databases
          </Typography>
          <Typography variant="caption" color="text.secondary">
            All databases attached to Data Bridge and registered for Risk Modeller.
          </Typography>
        </Box>
        <Stack direction="row" alignItems="center">
          <IconButton
            aria-label="Refresh databases"
            disabled={isFetching}
            onClick={() => void refetch()}
          >
            <RefreshIcon />
          </IconButton>
          <IconButton aria-label="Close Existing Databases" onClick={toggleDrawer}>
            <CloseIcon />
          </IconButton>
        </Stack>
      </Stack>

      <Box sx={{ pt: 2 }}>
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
    </Drawer>
  );
};
