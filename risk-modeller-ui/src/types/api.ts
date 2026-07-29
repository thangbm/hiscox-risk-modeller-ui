/**
 * Types that mirror the backend API (Hiscox.RiskModeller.Api) response shapes.
 * Keep these aligned with the Azure Functions contracts.
 */

/** Connectivity to Moody's Cloud RMS reported by `GET /api/status`. */
export interface MoodysConnectivity {
  status: string;
  clientIp: string | null;
}

/** Response of `GET /api/status` — service health/metadata. */
export interface ServiceStatus {
  service: string;
  status: string;
  description: string;
  timestampUtc: string;
  moodysConnectivity: MoodysConnectivity;
}

/** A database attached to Data Bridge and registered for use in Risk Modeller. */
export interface RegisteredDatabase {
  id: string;
  name: string;
  /** Registry the database came from. `DataBridge` today; other sources may follow. */
  source: string;
  lastSyncedUtc: string;
}

/** Response of `GET /api/data-import/databases`. */
export interface RegisteredDatabasesResponse {
  databases: RegisteredDatabase[];
  retrievedUtc: string;
}

/** One selectable option in a Data Import dropdown (data source / data type / schema). */
export interface ImportOption {
  id: string;
  name: string;
}

/** Response of `GET /api/data-import/options` — populates the New Data Import form dropdowns. */
export interface DataImportOptionsResponse {
  dataSources: ImportOption[];
  dataTypes: ImportOption[];
  schemas: ImportOption[];
}

/** The only modelling database kinds the scanner returns. */
export type ImportFileKind = 'EDM' | 'RDM';

/** One `.mdf`/`.bak` candidate database found by scanning the uploaded file/path. */
export interface ImportFileRow {
  /** Stable per file path — used as the React key and the selection key. */
  id: string;
  fileName: string;
  filePath: string;
  /** Raw bytes, so the client controls formatting and sorting. */
  fileSizeBytes: number;
  kind: ImportFileKind;
}

/** Response of `POST /api/data-import/uploads`. */
export interface UploadImportFileResponse {
  files: ImportFileRow[];
}

/** Request body of `POST /api/data-import/attach`. */
export interface AttachDatabasesRequest {
  files: { id: string; hiscoxName: string }[];
}

/** Response of `POST /api/data-import/attach` — the newly registered databases. */
export interface AttachDatabasesResponse {
  attached: RegisteredDatabase[];
}
