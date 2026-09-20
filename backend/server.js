/**
 * Local/long-running entry point. The app itself (routes, middleware,
 * lazy Supabase init) lives in app.js so Vercel's serverless function
 * can import the exact same stack — see api/index.js at the repo root.
 */

import app from './app.js';

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`☕ Café POS API listening on http://localhost:${PORT}`);
});
