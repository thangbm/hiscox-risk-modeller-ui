import { useQuery } from '@tanstack/react-query';
import { dataImportApi } from '@/features/data-import/api/dataImportApi';

/** Query key for the New Data Import dropdown options. */
export const importOptionsQueryKey = ['data-import', 'options'] as const;

/** Server state for the Data Source / Data Type / Schema dropdowns. */
export const useImportOptions = () =>
  useQuery({
    queryKey: importOptionsQueryKey,
    queryFn: ({ signal }) => dataImportApi.getImportOptions(signal),
  });
