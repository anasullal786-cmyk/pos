import { Router } from 'express';
import * as reports from '../controllers/reportController.js';
import * as settings from '../controllers/settingsController.js';
import * as store from '../services/store.js';
import { buildSeedMenu } from '../services/seedData.js';
import { buildTables } from '../services/seed.js';

const router = Router();

router.get('/reports', reports.getReports);
router.get('/settings', settings.get);
router.put('/settings', settings.update);

// Reset everything back to the original demo data (also wipes the
// persisted file, so the reset survives restarts too).
router.post('/reset', (_req, res) => {
  store.setState({
    menu: buildSeedMenu(),
    tables: buildTables(10),
    orders: [],
    settings: undefined,
  });
  store.setSettings({});
  res.json({ success: true, message: 'Demo data has been reset.' });
});

export default router;
