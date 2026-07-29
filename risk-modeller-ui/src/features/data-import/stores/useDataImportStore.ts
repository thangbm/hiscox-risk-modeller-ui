import { create } from 'zustand';
import type { MatchMode } from '@/features/data-import/types/dataImport';

interface DataImportState {
  /** Existing Databases drawer open/closed (session-only). */
  isDrawerOpen: boolean;
  /** Raw search box value; filtering happens live as it changes. */
  searchQuery: string;
  matchMode: MatchMode;

  /** New Data Import form selections (dropdown option ids). */
  dataSourceId: string;
  dataTypeId: string;
  schemaId: string;

  /** Name of the last file dropped/selected for scanning. */
  uploadedFileName: string | null;
  /** Ticked scan results, by file id. Never holds fetched rows. */
  selectedFileIds: string[];
  /** User-entered Hiscox Names, by file id. */
  hiscoxNames: Record<string, string>;

  toggleDrawer: () => void;
  setSearchQuery: (searchQuery: string) => void;
  clearSearch: () => void;
  setMatchMode: (matchMode: MatchMode) => void;

  setDataSourceId: (dataSourceId: string) => void;
  setDataTypeId: (dataTypeId: string) => void;
  setSchemaId: (schemaId: string) => void;

  setUploadedFileName: (fileName: string | null) => void;
  toggleFileSelection: (id: string) => void;
  setSelectedFileIds: (ids: string[]) => void;
  setHiscoxName: (id: string, name: string) => void;
  /** Clears the scan selection/names after a successful attach. */
  resetImportSelection: () => void;
}

const initialState = {
  isDrawerOpen: true,
  searchQuery: '',
  matchMode: 'AND' as MatchMode,
  dataSourceId: '',
  dataTypeId: '',
  schemaId: '',
  uploadedFileName: null,
  selectedFileIds: [],
  hiscoxNames: {},
} satisfies Partial<DataImportState>;

/**
 * Client UI state for the Data Import screen. Server data (registered
 * databases, dropdown options and scan results) belongs to React Query and is
 * deliberately absent here — this store only holds what the user has typed,
 * ticked or toggled.
 */
export const useDataImportStore = create<DataImportState>()((set) => ({
  ...initialState,

  toggleDrawer: () => set((state) => ({ isDrawerOpen: !state.isDrawerOpen })),
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  clearSearch: () => set({ searchQuery: '' }),
  setMatchMode: (matchMode) => set({ matchMode }),

  setDataSourceId: (dataSourceId) => set({ dataSourceId }),
  setDataTypeId: (dataTypeId) => set({ dataTypeId }),
  setSchemaId: (schemaId) => set({ schemaId }),

  setUploadedFileName: (uploadedFileName) =>
    set({ uploadedFileName, selectedFileIds: [], hiscoxNames: {} }),

  toggleFileSelection: (id) =>
    set((state) => ({
      selectedFileIds: state.selectedFileIds.includes(id)
        ? state.selectedFileIds.filter((selected) => selected !== id)
        : [...state.selectedFileIds, id],
    })),

  setSelectedFileIds: (ids) => set({ selectedFileIds: ids }),

  // Names survive unticking so a mis-click doesn't lose typing.
  setHiscoxName: (id, name) =>
    set((state) => ({ hiscoxNames: { ...state.hiscoxNames, [id]: name } })),

  resetImportSelection: () =>
    set({ uploadedFileName: null, selectedFileIds: [], hiscoxNames: {} }),
}));

/** Restores the defaults. Used by tests, since the store is module-level. */
export const resetDataImportStore = (): void => {
  useDataImportStore.setState(initialState);
};
