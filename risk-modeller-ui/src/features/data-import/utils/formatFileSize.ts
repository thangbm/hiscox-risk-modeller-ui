const UNITS = ['B', 'KB', 'MB', 'GB', 'TB'] as const;

/** Formats raw bytes as a human-readable size, e.g. `1_524_713_390` -> `"1.42 GB"`. */
export const formatFileSize = (bytes: number): string => {
  if (bytes <= 0) return '0 B';

  const exponent = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), UNITS.length - 1);
  const value = bytes / 1024 ** exponent;
  const formatted = exponent === 0 ? String(value) : value.toFixed(2);

  return `${formatted} ${UNITS[exponent]}`;
};
