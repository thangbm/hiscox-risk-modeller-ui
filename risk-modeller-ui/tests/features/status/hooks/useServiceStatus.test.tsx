import type { ReactNode } from 'react';
import { describe, it, expect } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useServiceStatus } from '@/features/status/hooks/useServiceStatus';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useServiceStatus', () => {
  it('returns the service status from the API', async () => {
    const { result } = renderHook(() => useServiceStatus(), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.service).toBe('Hiscox.RiskModeller.Api');
    expect(result.current.data?.status).toBe('Healthy');
  });
});
