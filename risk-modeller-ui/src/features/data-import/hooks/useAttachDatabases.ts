import { useMutation, useQueryClient } from '@tanstack/react-query';
import { dataImportApi } from '@/features/data-import/api/dataImportApi';
import { registeredDatabasesQueryKey } from '@/features/data-import/hooks/useRegisteredDatabases';

/**
 * Registers ticked files in Data Bridge. On success, invalidates the
 * registered-databases query so the Existing Databases drawer picks up the
 * newly attached rows.
 */
export const useAttachDatabases = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (files: { id: string; hiscoxName: string }[]) =>
      dataImportApi.attachDatabases(files),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: registeredDatabasesQueryKey });
    },
  });
};
