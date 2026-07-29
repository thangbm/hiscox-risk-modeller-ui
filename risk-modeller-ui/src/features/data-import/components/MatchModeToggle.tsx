import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import type { MatchMode } from '@/features/data-import/types/dataImport';

export interface MatchModeToggleProps {
  value: MatchMode;
  onChange: (value: MatchMode) => void;
}

const toggleButtonSx = {
  px: 1.5,
  py: 0.25,
  fontSize: '0.7rem',
  fontWeight: 700,
  letterSpacing: '0.04em',
  '&.Mui-selected': {
    bgcolor: 'success.main',
    color: '#fff',
    '&:hover': { bgcolor: 'success.dark' },
  },
} as const;

/**
 * Chooses how space-separated search terms are combined: AND (all terms must
 * match) or OR (any term matches). Defaults are owned by the caller.
 */
export const MatchModeToggle = ({ value, onChange }: MatchModeToggleProps) => (
  <ToggleButtonGroup
    exclusive
    size="small"
    value={value}
    aria-label="Match mode"
    sx={{ flexShrink: 0 }}
    onChange={(_event, next: MatchMode | null) => {
      // `next` is null when the active button is clicked again; keep the mode.
      if (next) onChange(next);
    }}
  >
    <ToggleButton value="AND" sx={toggleButtonSx}>AND</ToggleButton>
    <ToggleButton value="OR" sx={toggleButtonSx}>OR</ToggleButton>
  </ToggleButtonGroup>
);
