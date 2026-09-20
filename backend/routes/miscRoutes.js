import { Router } from 'express';
import * as reports from '../controllers/reportController.js';
import * as settings from '../controllers/settingsController.js';
import * as store from '../services/store.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { buildSeedMenu } from '../services/seedData.js';
import { buildTables } from '../services/seed.js';

const router = Router();

router.get('/reports', asyncHandler(reports.getReports));
router.get('/settings', asyncHandler(settings.get));
router.put('/settings', asyncHandler(settings.update));

// Reset everything back to the original demo data. The database is
// wiped and re-seeded, so the reset survives restarts too.
router.post(
  '/reset',
  asyncHandler(async (_req, res) => {
    await store.resetAll({ menu: buildSeedMenu(), tables: buildTables(10) });
    res.json({ success: true, message: 'Demo data has been reset.' });
  })
);

export default router;
