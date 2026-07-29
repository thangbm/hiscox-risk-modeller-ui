import { setupServer } from 'msw/node';
import { handlers } from '@/mocks/handlers';

/** Node MSW server used by Vitest (wired up in tests/setup.ts). */
export const server = setupServer(...handlers);
