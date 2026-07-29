import { QueryClient } from '@tanstack/react-query';

/**
 * Shared React Query client. Defaults tuned for a list/detail REST app:
 * a short stale time avoids redundant refetches while keeping data fresh.
 */
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
