import { List, ListItem, ListItemText, Typography } from '@mui/material';
import type { RegisteredDatabase } from '@/types/api';
import { formatSyncedTime } from '@/features/data-import/utils/formatSyncedTime';

export interface ExistingDatabaseListProps {
  databases: RegisteredDatabase[];
  /** Shown instead of the list when `databases` is empty. */
  emptyMessage: string;
}

/**
 * Names (and last-synced time) of the registered databases. Information
 * only — rows are deliberately not interactive at this stage.
 */
export const ExistingDatabaseList = ({
  databases,
  emptyMessage,
}: ExistingDatabaseListProps) => {
  if (databases.length === 0) {
    return (
      <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
        {emptyMessage}
      </Typography>
    );
  }

  return (
    <List dense disablePadding aria-label="Existing databases">
      {databases.map((database) => (
        <ListItem key={database.id} disableGutters divider>
          <ListItemText
            primary={database.name}
            secondary={`Last synced: ${formatSyncedTime(database.lastSyncedUtc)}`}
            slotProps={{ primary: { variant: 'body2', sx: { wordBreak: 'break-all' } } }}
          />
        </ListItem>
      ))}
    </List>
  );
};
