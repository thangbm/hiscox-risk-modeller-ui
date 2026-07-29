import { Box, Container } from '@mui/material';
import { PageHeader } from '@/components';
import { ServiceStatusCard } from '@/features/status';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

/**
 * Landing page for the Risk Modeller module. Surfaces the live backend health
 * status as a first integration point against Hiscox.RiskModeller.Api.
 */
export const DashboardPage = () => {
  useDocumentTitle('Risk Modeller');

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <PageHeader
        title="Risk Modeller"
        subtitle="Integration layer for Moody's Cloud RMS (Intelligent Risk Platform)"
      />
      <Box sx={{ display: 'grid', gap: 2 }}>
        <ServiceStatusCard />
      </Box>
    </Container>
  );
};
