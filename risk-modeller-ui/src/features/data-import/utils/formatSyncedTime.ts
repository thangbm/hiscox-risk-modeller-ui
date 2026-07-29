/** Formats an ISO UTC timestamp as a local date-and-time string, e.g. `"12 Jun 2026, 09:14"`. */
export const formatSyncedTime = (isoTimestamp: string): string =>
  new Date(isoTimestamp).toLocaleString(undefined, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
