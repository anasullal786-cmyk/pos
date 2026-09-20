import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import menuRoutes from './routes/menuRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import tableRoutes from './routes/tableRoutes.js';
import miscRoutes from './routes/miscRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';
import * as store from './services/store.js';
import { buildSeedMenu } from './services/seedData.js';
import { buildTables } from './services/seed.js';

dotenv.config();

// Load saved data from disk, or seed the store on first run (orders
// start empty). All later changes are persisted on every mutation.
store.initialize({
  menu: buildSeedMenu(),
  tables: buildTables(10),
  orders: [],
});

const app = express();
app.use(cors());
// Base64-encoded menu images ride along in JSON payloads; the default
// 100kb limit is too small, so allow up to 2 MB.
app.use(express.json({ limit: '2mb' }));

app.get('/api/health', (_req, res) =>
  res.json({ success: true, status: 'ok', uptime: process.uptime() })
);
app.use('/api/menu', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/tables', tableRoutes);
app.use('/api', miscRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`☕ Café POS API listening on http://localhost:${PORT}`);
});
