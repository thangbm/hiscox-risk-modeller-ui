import { apiClient } from '@/utils/apiClient';
import type {
  AttachDatabasesResponse,
  DataImportOptionsResponse,
  RegisteredDatabasesResponse,
  UploadImportFileResponse,
} from '@/types/api';

/** API calls for the data-import feature. */
export const dataImportApi = {
  /** Databases attached to Data Bridge and registered for Risk Modeller. */
  getRegisteredDatabases: (signal?: AbortSignal): Promise<RegisteredDatabasesResponse> =>
    apiClient.get<RegisteredDatabasesResponse>('/data-import/databases', signal),

  /** Dropdown options for the New Data Import form (source / type / schema). */
  getImportOptions: (signal?: AbortSignal): Promise<DataImportOptionsResponse> =>
    apiClient.get<DataImportOptionsResponse>('/data-import/options', signal),

  /**
   * Scans the dropped/selected file server-side and returns the EDM/RDM
   * databases found. Only the file name is sent — parsing happens entirely
   * on the backend.
   */
  uploadImportFile: (fileName: string, signal?: AbortSignal): Promise<UploadImportFileResponse> =>
    apiClient.post<UploadImportFileResponse>('/data-import/uploads', { fileName }, signal),

  /** Registers the ticked files (with their Hiscox Names) in Data Bridge. */
  attachDatabases: (
    files: { id: string; hiscoxName: string }[],
    signal?: AbortSignal,
  ): Promise<AttachDatabasesResponse> =>
    apiClient.post<AttachDatabasesResponse>('/data-import/attach', { files }, signal),
};
