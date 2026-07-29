import { Box, Stack, Typography } from '@mui/material';
import { Button, TextField } from '@re/frontend-shared';
import { MatchModeToggle } from '@/features/data-import/components/MatchModeToggle';
import type { MatchMode } from '@/features/data-import/types/dataImport';

export interface DatabaseSearchBarProps {
  query: string;
  matchMode: MatchMode;
  /** Number of databases left after filtering. */
  resultCount: number;
  /** Number of databases before filtering. */
  totalCount: number;
  onQueryChange: (query: string) => void;
  onMatchModeChange: (matchMode: MatchMode) => void;
  onClear: () => void;
}

/**
 * Search box for the Existing Databases list. Reports every keystroke so the
 * list filters live; spaces separate terms, combined per the match mode.
 */
export const DatabaseSearchBar = ({
  query,
  matchMode,
  resultCount,
  totalCount,
  onQueryChange,
  onMatchModeChange,
  onClear,
}: DatabaseSearchBarProps) => (
  <Box>
    <Stack direction="row" spacing={1} alignItems="center">
      <TextField
        fullWidth
        size="small"
        label="Search databases"
        placeholder="e.g. finance operations"
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
      />
      <Button tier="tertiary" size="small" disabled={query.length === 0} onClick={onClear}>
        Clear
      </Button>
      <MatchModeToggle value={matchMode} onChange={onMatchModeChange} />
    </Stack>
    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
      {`Showing ${resultCount} of ${totalCount} · terms separated by spaces are combined with ${matchMode}`}
    </Typography>
  </Box>
);
