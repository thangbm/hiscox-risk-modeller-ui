import { useMutation } from '@tanstack/react-query';
import { dataImportApi } from '@/features/data-import/api/dataImportApi';

/**
 * Scans a dropped/selected file for EDM/RDM databases. A mutation (not a
 * query) because it is explicitly triggered by the user picking a file, not
 * derived from a cache key.
 */
export const useUploadImportFile = () =>
  useMutation({
    mutationFn: (fileName: string) => dataImportApi.uploadImportFile(fileName),
  });
