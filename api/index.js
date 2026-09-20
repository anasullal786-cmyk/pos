/**
 * Vercel serverless entry point for the Café POS API.
 *
 * Vercel runs everything under /api as serverless functions; this file
 * exports the shared Express app (backend/app.js) as the handler. The
 * Supabase connection is made lazily on the first request (see
 * ensureReady in backend/app.js) — serverless instances must not block
 * startup.
 */

import app from '../backend/app.js';

export default app;
