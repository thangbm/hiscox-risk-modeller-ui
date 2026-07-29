import { describe, it, expect, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '@/mocks/server';
import { apiClient, setAuthTokenAccessor } from '@/utils/apiClient';
import type { ServiceStatus } from '@/types/api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

afterEach(() => setAuthTokenAccessor(null));

describe('apiClient', () => {
  it('performs a GET and returns parsed JSON', async () => {
    const data = await apiClient.get<ServiceStatus>('/status');
    expect(data.service).toBe('Hiscox.RiskModeller.Api');
  });

  it('attaches the bearer token when an accessor is set', async () => {
    let received: string | null = null;
    server.use(
      http.get(`${BASE_URL}/status`, ({ request }) => {
        received = request.headers.get('authorization');
        return HttpResponse.json({});
      }),
    );
    setAuthTokenAccessor(() => 'test-token');

    await apiClient.get('/status');
    expect(received).toBe('Bearer test-token');
  });

  it('throws an ApiError on a non-ok response', async () => {
    server.use(
      http.get(`${BASE_URL}/status`, () =>
        HttpResponse.json({}, { status: 500 }),
      ),
    );

    await expect(apiClient.get('/status')).rejects.toMatchObject({
      status: 500,
    });
  });
});
