import { useState } from 'react';
import {
  Alert,
  Box,
  Checkbox,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import { Button } from '@re/frontend-shared';
import { useDataImportStore } from '@/features/data-import/stores/useDataImportStore';
import { useUploadImportFile } from '@/features/data-import/hooks/useUploadImportFile';
import { useAttachDatabases } from '@/features/data-import/hooks/useAttachDatabases';
import { validateHiscoxNames } from '@/features/data-import/utils/validateHiscoxNames';
import { formatFileSize } from '@/features/data-import/utils/formatFileSize';

const SCAN_DESCRIPTION =
  "Searches the Brian Z Drive 'Modelling Files' folder for this program ID — including " +
  'sub-folders and zipped archives — and returns only EDM and RDM databases (.mdf / .bak). ' +
  'Other .mdf files such as Cede or AIRExp are ignored.';

/**
 * Right-hand panel of the Data Import page. Lets the user enter a Brian
 * Program ID, scan the Z Drive, review the found databases, and attach
 * selected ones to Data Bridge.
 */
export const NewDataImportPanel = () => {
  const uploadedFileName = useDataImportStore((state) => state.uploadedFileName);
  const setUploadedFileName = useDataImportStore((state) => state.setUploadedFileName);
  const selectedFileIds = useDataImportStore((state) => state.selectedFileIds);
  const toggleFileSelection = useDataImportStore((state) => state.toggleFileSelection);
  const setSelectedFileIds = useDataImportStore((state) => state.setSelectedFileIds);
  const hiscoxNames = useDataImportStore((state) => state.hiscoxNames);
  const setHiscoxName = useDataImportStore((state) => state.setHiscoxName);
  const resetImportSelection = useDataImportStore((state) => state.resetImportSelection);

  const [hiscoxErrors, setHiscoxErrors] = useState<Record<string, string>>({});

  const scanMutation = useUploadImportFile();
  const attachMutation = useAttachDatabases();

  const files = scanMutation.data?.files ?? [];

  const handleScan = () => {
    if (!uploadedFileName) return;
    setHiscoxErrors({});
    scanMutation.mutate(uploadedFileName, {
      onSuccess: (data) => {
        setSelectedFileIds(data.files.map((f) => f.id));
      },
    });
  };

  const allSelected = files.length > 0 && selectedFileIds.length === files.length;
  const someSelected = selectedFileIds.length > 0 && selectedFileIds.length < files.length;

  const handleSelectAll = (checked: boolean) => {
    setSelectedFileIds(checked ? files.map((f) => f.id) : []);
  };

  const handleClear = () => {
    resetImportSelection();
    setHiscoxErrors({});
    scanMutation.reset();
    attachMutation.reset();
  };

  const handleAttach = () => {
    const errors = validateHiscoxNames(selectedFileIds, hiscoxNames);
    if (Object.keys(errors).length > 0) {
      setHiscoxErrors(errors);
      return;
    }
    setHiscoxErrors({});

    const payload = selectedFileIds.map((id) => ({
      id,
      hiscoxName: (hiscoxNames[id] ?? '').trim(),
    }));

    attachMutation.mutate(payload, {
      onSuccess: () => {
        handleClear();
      },
    });
  };

  return (
    <Box sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column', gap: 2, overflow: 'auto' }}>
      <Typography variant="h6" component="h2">
        New Data Import
      </Typography>

      {/* Brian Program ID + Scan */}
      <Box>
        <Typography variant="body2" fontWeight="medium" gutterBottom>
          Brian Program ID
        </Typography>
        <Stack direction="row" spacing={1} alignItems="flex-start">
          <TextField
            size="small"
            placeholder="e.g. 61741"
            value={uploadedFileName ?? ''}
            onChange={(e) => setUploadedFileName(e.target.value || null)}
            sx={{ width: 200 }}
            inputProps={{ 'aria-label': 'Brian Program ID' }}
          />
          <Button
            tier="primary"
            disabled={!uploadedFileName || scanMutation.isPending}
            onClick={handleScan}
          >
            Scan Z Drive
          </Button>
        </Stack>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block', maxWidth: 600 }}>
          {SCAN_DESCRIPTION}
        </Typography>
      </Box>

      {scanMutation.isError && (
        <Alert severity="error">Failed to scan Z Drive. Please try again.</Alert>
      )}

      {/* Results table */}
      {files.length > 0 && (
        <>
          <TableContainer component={Paper} variant="outlined">
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      size="small"
                      checked={allSelected}
                      indeterminate={someSelected}
                      onChange={(e) => handleSelectAll(e.target.checked)}
                      inputProps={{ 'aria-label': 'Select all files' }}
                    />
                  </TableCell>
                  <TableCell>
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                      <span>File Name</span>
                      <Button
                        tier="tertiary"
                        size="small"
                        onClick={() => handleSelectAll(!allSelected)}
                        sx={{ minWidth: 0, px: 0.5, fontSize: '0.75rem' }}
                      >
                        {allSelected ? 'deselect all' : 'select all'}
                      </Button>
                    </Stack>
                  </TableCell>
                  <TableCell>File Size</TableCell>
                  <TableCell>File Path</TableCell>
                  <TableCell sx={{ minWidth: 200 }}>Hiscox Name</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {files.map((file) => {
                  const isSelected = selectedFileIds.includes(file.id);
                  const nameError = hiscoxErrors[file.id];
                  return (
                    <TableRow key={file.id} selected={isSelected}>
                      <TableCell padding="checkbox">
                        <Checkbox
                          size="small"
                          checked={isSelected}
                          onChange={() => toggleFileSelection(file.id)}
                          inputProps={{ 'aria-label': `Select ${file.fileName}` }}
                        />
                      </TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>{file.fileName}</TableCell>
                      <TableCell sx={{ whiteSpace: 'nowrap' }}>
                        {formatFileSize(file.fileSizeBytes)}
                      </TableCell>
                      <TableCell
                        sx={{
                          maxWidth: 260,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={file.filePath}
                      >
                        {file.filePath}
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          placeholder="Enter Hiscox Name"
                          value={hiscoxNames[file.id] ?? ''}
                          onChange={(e) => {
                            setHiscoxName(file.id, e.target.value);
                            if (hiscoxErrors[file.id]) {
                              setHiscoxErrors((prev) => {
                                const next = { ...prev };
                                delete next[file.id];
                                return next;
                              });
                            }
                          }}
                          error={isSelected && !!nameError}
                          helperText={isSelected ? nameError : undefined}
                          disabled={!isSelected}
                          inputProps={{ 'aria-label': `Hiscox Name for ${file.fileName}` }}
                          sx={{ width: 200 }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Footer */}
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">
              {selectedFileIds.length} of {files.length} databases selected.
            </Typography>
            <Stack direction="row" spacing={1}>
              <Button tier="secondary" onClick={handleClear}>
                Clear
              </Button>
              <Button
                tier="primary"
                disabled={selectedFileIds.length === 0 || attachMutation.isPending}
                onClick={handleAttach}
              >
                Attach to Data Bridge
              </Button>
            </Stack>
          </Stack>

          {attachMutation.isError && (
            <Alert severity="error">Failed to attach databases. Please try again.</Alert>
          )}

          {attachMutation.isSuccess && (
            <Alert severity="success">
              {`${attachMutation.data.attached.length} database${attachMutation.data.attached.length !== 1 ? 's' : ''} attached successfully.`}
            </Alert>
          )}
        </>
      )}
    </Box>
  );
};
