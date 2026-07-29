import { useQuery } from '@tanstack/react-query';
import { dataImportApi } from '@/features/data-import/api/dataImportApi';

/** Query key for the registered-databases request (single source of truth). */
export const registeredDatabasesQueryKey = ['data-import', 'databases'] as const;

/**
 * Server state for the Existing Databases drawer. `refetch` backs the refresh
 * control, which is how newly attached & registered databases are picked up.
 */
export const useRegisteredDatabases = () =>
  useQuery({
    queryKey: registeredDatabasesQueryKey,
    queryFn: ({ signal }) => dataImportApi.getRegisteredDatabases(signal),
  });
