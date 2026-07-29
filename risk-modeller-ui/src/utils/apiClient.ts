import type { ApiError } from '@/types/common';

/**
 * Minimal typed fetch wrapper around the backend API.
 *
 * Base URL comes from `VITE_API_BASE_URL`. The fallback is the same-origin
 * `/api` path: in dev the Vite server proxies it to the backend (avoiding CORS);
 * in other environments the host/ingress routes `/api` to the backend.
 */
const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

/**
 * Optional bearer token accessor. In production this is wired to the auth token
 * the Rehub host provides via the shared MSAL context (see stubs/frontend-shared).
 * Left injectable so the client has no direct dependency on the auth layer.
 */
let getToken: (() => string | null | Promise<string | null>) | null = null;

export const setAuthTokenAccessor = (
  accessor: (() => string | null | Promise<string | null>) | null,
): void => {
  getToken = accessor;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set('accept', 'application/json');

  if (getToken) {
    const token = await getToken();
    if (token) headers.set('authorization', `Bearer ${token}`);
  }

  const response = await fetch(`${BASE_URL}${path}`, { ...init, headers });

  if (!response.ok) {
    const error: ApiError = {
      status: response.status,
      message: `Request to ${path} failed with status ${response.status}`,
    };
    throw error;
  }

  return (await response.json()) as T;
}

export const apiClient = {
  get: <T>(path: string, signal?: AbortSignal): Promise<T> =>
    request<T>(path, { method: 'GET', signal }),

  post: <T>(path: string, body: unknown, signal?: AbortSignal): Promise<T> =>
    request<T>(path, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
      signal,
    }),
};
