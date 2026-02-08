// apps/web/src/test/mocks/server.ts
import { setupServer } from 'msw/node';
import { handlers } from './handlers';

/**
 * MSW server instance for Node.js (tests)
 */
export const server = setupServer(...handlers);
