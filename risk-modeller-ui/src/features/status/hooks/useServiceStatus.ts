import { useQuery } from '@tanstack/react-query';
import { statusApi } from '@/features/status/api/statusApi';

/** Query key for the service-status request (single source of truth). */
export const statusQueryKey = ['status'] as const;

/**
 * React Query owns the server state for the backend health endpoint:
 * loading/error/data, caching, dedup and background refetch.
 */
export const useServiceStatus = () =>
  useQuery({
    queryKey: statusQueryKey,
    queryFn: ({ signal }) => statusApi.getStatus(signal),
  });
