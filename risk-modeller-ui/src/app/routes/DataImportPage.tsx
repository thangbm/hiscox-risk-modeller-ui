import { Box } from '@mui/material';
import { PageHeader } from '@/components';
import { ExistingDatabasesPanel } from '@/features/data-import/components/ExistingDatabasesPanel';
import { NewDataImportPanel } from '@/features/data-import/components/NewDataImportPanel';
import { useDocumentTitle } from '@/hooks/useDocumentTitle';

/**
 * Data Import page. Two-column layout: a collapsible Existing Databases panel
 * on the left (search + list of registered databases) and the New Data Import
 * form on the right (scan Z Drive by Brian Program ID, review results, attach).
 */
export const DataImportPage = () => {
  useDocumentTitle('Data Import');

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <Box sx={{ px: 3, pt: 3, pb: 1, flexShrink: 0 }}>
        <PageHeader
          title="Data Import"
          subtitle="Review the databases already registered with Data Bridge and import new ones."
        />
      </Box>
      <Box sx={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
        <ExistingDatabasesPanel />
        <NewDataImportPanel />
      </Box>
    </Box>
  );
};
