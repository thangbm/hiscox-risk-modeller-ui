import type { ServiceStatus } from '@/types/api';

/** Fixture mirroring the real `GET /api/status` response shape. */
export const mockServiceStatus: ServiceStatus = {
  service: 'Hiscox.RiskModeller.Api',
  status: 'Healthy',
  description:
    "Azure Functions (isolated worker) API on .NET 10 that acts as the integration layer between Hiscox internal systems and Moody's Cloud RMS (Intelligent Risk Platform).",
  timestampUtc: '2026-06-25T11:21:24.8877946+00:00',
  moodysConnectivity: {
    status: 'Reachable',
    clientIp: '203.0.113.42',
  },
};
