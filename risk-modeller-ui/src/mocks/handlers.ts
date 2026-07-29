import { http, HttpResponse } from 'msw';
import { mockServiceStatus } from '@/mocks/data/serviceStatus';
import {
  buildMockAttachResponse,
  mockImportOptions,
  mockRegisteredDatabases,
  mockUploadImportFile,
} from '@/mocks/data/dataImport';
import type { AttachDatabasesRequest } from '@/types/api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';

/** MSW request handlers shared across tests (and optional dev mocking). */
export const handlers = [
  http.get(`${BASE_URL}/status`, () => HttpResponse.json(mockServiceStatus)),
  http.get(`${BASE_URL}/data-import/databases`, () => HttpResponse.json(mockRegisteredDatabases)),
  http.get(`${BASE_URL}/data-import/options`, () => HttpResponse.json(mockImportOptions)),
  http.post(`${BASE_URL}/data-import/uploads`, () => HttpResponse.json(mockUploadImportFile)),
  http.post(`${BASE_URL}/data-import/attach`, async ({ request }) => {
    const body = (await request.json()) as AttachDatabasesRequest;
    return HttpResponse.json(buildMockAttachResponse(body.files));
  }),
];
