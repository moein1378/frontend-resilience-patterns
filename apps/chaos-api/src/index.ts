import { serve } from '@hono/node-server';
import { createHonoApp } from './app.js';

const port = Number(process.env.PORT ?? 3001);
const app = createHonoApp();

serve({ fetch: app.fetch, port }, ({ port: listeningPort }) => {
  console.log(`Chaos API listening on http://localhost:${listeningPort}`);
});
