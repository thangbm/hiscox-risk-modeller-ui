import { Box, IconButton, InputAdornment, Stack, TextField, Typography } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import { Button } from '@re/frontend-shared';
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
        placeholder="Search databases..."
        value={query}
        onChange={(event) => onQueryChange(event.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
            </InputAdornment>
          ),
          endAdornment: query ? (
            <InputAdornment position="end">
              <IconButton
                size="small"
                aria-label="Clear search"
                onClick={onClear}
                edge="end"
                sx={{ color: 'text.secondary' }}
              >
                <CloseIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </InputAdornment>
          ) : undefined,
        }}
      />
      <Button tier="tertiary" size="small" disabled={query.length === 0} onClick={onClear}>
        CLEAR
      </Button>
      <MatchModeToggle value={matchMode} onChange={onMatchModeChange} />
    </Stack>
    <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
      {`${resultCount} of ${totalCount}`}
    </Typography>
  </Box>
);
