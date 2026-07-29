import { Typography, Box } from '@mui/material';

export function HomePage() {
  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Welcome
      </Typography>
      <Typography variant="body1" color="text.secondary">
        This is the Risk Modeller shell. Use the navigation on the left to open
        the Risk Modeller micro-frontend.
      </Typography>
    </Box>
  );
}
