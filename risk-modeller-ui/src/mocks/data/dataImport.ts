import type {
  AttachDatabasesResponse,
  DataImportOptionsResponse,
  RegisteredDatabasesResponse,
  UploadImportFileResponse,
} from '@/types/api';

/** Fixture mirroring `GET /api/data-import/databases`. */
export const mockRegisteredDatabases: RegisteredDatabasesResponse = {
  retrievedUtc: '2026-07-29T09:15:00.0000000+00:00',
  databases: [
    {
      id: 'db-001',
      name: 'DB_FINANCE_H1_2024',
      source: 'DataBridge',
      lastSyncedUtc: '2026-07-29T09:10:00.0000000+00:00',
    },
    {
      id: 'db-002',
      name: 'DB_OPERATIONS_Q3_2023',
      source: 'DataBridge',
      lastSyncedUtc: '2026-07-29T08:55:00.0000000+00:00',
    },
    {
      id: 'db-003',
      name: 'DB_GLOBAL_MARKET_DATA',
      source: 'DataBridge',
      lastSyncedUtc: '2026-07-29T07:40:00.0000000+00:00',
    },
    {
      id: 'db-004',
      name: 'DB_HR_COMPLIANCE_A',
      source: 'DataBridge',
      lastSyncedUtc: '2026-07-28T22:10:00.0000000+00:00',
    },
    {
      id: 'db-005',
      name: 'DB_SALES_PERFORMANCE_NA',
      source: 'DataBridge',
      lastSyncedUtc: '2026-07-28T20:05:00.0000000+00:00',
    },
    {
      id: 'db-006',
      name: 'DB_RISK_ANALYTICS_2026_US',
      source: 'DataBridge',
      lastSyncedUtc: '2026-07-29T06:30:00.0000000+00:00',
    },
    {
      id: 'db-007',
      name: 'DB_OPERATIONS_2022',
      source: 'DataBridge',
      lastSyncedUtc: '2026-07-20T11:20:00.0000000+00:00',
    },
  ],
};

/** Fixture mirroring `GET /api/data-import/options` — New Data Import form dropdowns. */
export const mockImportOptions: DataImportOptionsResponse = {
  dataSources: [{ id: 'data-bridge', name: 'Data Bridge' }],
  dataTypes: [{ id: 'mpp-exportation', name: 'MPP exportation' }],
  schemas: [{ id: 'default-internal', name: 'Default internal' }],
};

/** Fixture mirroring `POST /api/data-import/uploads` — files found in the uploaded file/path. */
export const mockUploadImportFile: UploadImportFileResponse = {
  files: [
    {
      id: 'file-1',
      fileName: 'US_Property_2026_EDM.mdf',
      filePath: 'Z:\\Modelling Files\\61741\\Exposure\\US_Property_2026_EDM.mdf',
      fileSizeBytes: 1_524_713_390,
      kind: 'EDM',
    },
    {
      id: 'file-2',
      fileName: 'US_Property_2026_RDM.mdf',
      filePath: 'Z:\\Modelling Files\\61741\\Results\\US_Property_2026_RDM.mdf',
      fileSizeBytes: 3_060_164_198,
      kind: 'RDM',
    },
  ],
};

/** Builds a `POST /api/data-import/attach` response fixture for the given ticked files. */
export const buildMockAttachResponse = (
  files: { id: string; hiscoxName: string }[],
): AttachDatabasesResponse => ({
  attached: files.map((file) => ({
    id: `attached-${file.id}`,
    name: file.hiscoxName,
    source: 'DataBridge',
    lastSyncedUtc: '2026-07-29T09:20:00.0000000+00:00',
  })),
});
