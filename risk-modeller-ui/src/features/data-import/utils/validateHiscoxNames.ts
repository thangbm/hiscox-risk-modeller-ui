/**
 * Validates the Hiscox Name typed for each ticked file: required, and unique
 * (case-insensitive, trimmed) across all currently-ticked rows. Unticked rows
 * are never validated, even if they hold a typed value.
 */
export const validateHiscoxNames = (
  selectedFileIds: string[],
  hiscoxNames: Record<string, string>,
): Record<string, string> => {
  const errors: Record<string, string> = {};
  const firstIdByName = new Map<string, string>();

  for (const id of selectedFileIds) {
    const trimmed = (hiscoxNames[id] ?? '').trim();

    if (!trimmed) {
      errors[id] = 'Hiscox Name is required';
      continue;
    }

    const key = trimmed.toLowerCase();
    const firstId = firstIdByName.get(key);
    if (firstId) {
      errors[id] = 'Hiscox Name must be unique';
      errors[firstId] = 'Hiscox Name must be unique';
    } else {
      firstIdByName.set(key, id);
    }
  }

  return errors;
};
