import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Typography,
} from '@mui/material';
import { useServiceStatus } from '@/features/status/hooks/useServiceStatus';

/** Maps a backend status string to an MUI chip colour. */
const statusColor = (status: string) =>
  status.toLowerCase() === 'healthy' ? 'success' : 'warning';

/** Maps a Moody's connectivity status string to an MUI chip colour. */
const connectivityColor = (status: string) =>
  status.toLowerCase() === 'reachable' ? 'success' : 'error';

/**
 * Renders the live response of `GET /api/status` from the backend
 * (Hiscox.RiskModeller.Api): service name, health, description and timestamp.
 */
export const ServiceStatusCard = () => {
  const { data, isLoading, error } = useServiceStatus();

  if (isLoading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress aria-label="Loading service status" />
      </Box>
    );
  }

  if (error || !data) {
    return (
      <Alert severity="error">
        Failed to load service status. Is the backend API running on the
        configured port?
      </Alert>
    );
  }

  return (
    <Card variant="outlined">
      <CardContent>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 2 }}
        >
          <Typography variant="h6" component="h2">
            {data.service}
          </Typography>
          <Chip
            label={data.status}
            color={statusColor(data.status)}
            size="small"
          />
        </Stack>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {data.description}
        </Typography>

        <Stack
          direction="row"
          spacing={1}
          alignItems="center"
          sx={{ mb: 2 }}
        >
          <Typography variant="body2" component="span">
            Moody&apos;s connectivity:
          </Typography>
          <Chip
            label={data.moodysConnectivity.status}
            color={connectivityColor(data.moodysConnectivity.status)}
            size="small"
          />
          {data.moodysConnectivity.clientIp && (
            <Typography variant="body2" color="text.secondary" component="span">
              (client IP: {data.moodysConnectivity.clientIp})
            </Typography>
          )}
        </Stack>

        <Typography variant="caption" color="text.secondary">
          Last checked: {new Date(data.timestampUtc).toLocaleString()}
        </Typography>
      </CardContent>
    </Card>
  );
};
