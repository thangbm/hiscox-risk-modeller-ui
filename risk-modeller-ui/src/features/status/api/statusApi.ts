import { apiClient } from '@/utils/apiClient';
import type { ServiceStatus } from '@/types/api';

/** API calls for the service-status feature. */
export const statusApi = {
  getStatus: (signal?: AbortSignal): Promise<ServiceStatus> =>
    apiClient.get<ServiceStatus>('/status', signal),
};
