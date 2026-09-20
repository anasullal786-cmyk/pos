/**
 * Express app, exported without calling .listen().
 *
 * `npm run dev` (server.js) keeps a long-running server for local work,
 * while Vercel imports this same app into a serverless function — the
 * middleware stack below is shared by both.
 *
 * The Supabase data layer is initialised lazily on the first request
 * (and cached in module scope) instead of at boot, because serverless
 * environments cannot block startup: each cold instance connects on its
 * first invocation. In warm instances `ready` is already true and the
 * check is a no-op.
 */

import express from 'express';
import cors from 'cors';

import menuRoutes from './routes/menuRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import tableRoutes from './routes/tableRoutes.js';
import miscRoutes from './routes/miscRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import * as store from './services/store.js';
import { buildSeedMenu } from './services/seedData.js';
import { buildTables } from './services/seed.js';

let ready = null; // promise cache: init runs at most once per instance

/** Connect/seed once per serverless instance; resolves when the API can serve. */
export function ensureReady() {
  if (!ready) {
    ready = store
      .initialize({ menu: buildSeedMenu(), tables: buildTables(10) })
      .then(() => console.log('[app] Supabase data layer ready.'))
      .catch((err) => {
        ready = null; // allow a retry on the next request
        throw err;
      });
  }
  return ready;
}

const app = express();
app.use(cors());
// Base64-encoded menu images ride along in JSON payloads; the default
// 100kb limit is too small, so allow up to 2 MB.
app.use(express.json({ limit: '2mb' }));

// Gate every /api route behind the lazy init.
app.use('/api', (req, res, next) => {
  ensureReady()
    .then(() => next())
    .catch((err) => {
      console.error('[app] data layer unavailable:', err.message);
      res.status(503).json({
        success: false,
        message: 'Database unavailable, please retry.',
      });
    });
});

app.get('/api/health', (_req, res) =>
  res.json({ success: true, status: 'ok', uptime: process.uptime() })
);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api', miscRoutes);

app.use(notFound);
app.use(errorHandler);

export default app;
