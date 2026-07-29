import { ToggleButton, ToggleButtonGroup } from '@mui/material';
import type { MatchMode } from '@/features/data-import/types/dataImport';

export interface MatchModeToggleProps {
  value: MatchMode;
  onChange: (value: MatchMode) => void;
}

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
    onChange={(_event, next: MatchMode | null) => {
      // `next` is null when the active button is clicked again; keep the mode.
      if (next) onChange(next);
    }}
  >
    <ToggleButton value="AND">AND</ToggleButton>
    <ToggleButton value="OR">OR</ToggleButton>
  </ToggleButtonGroup>
);
