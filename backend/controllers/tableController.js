import * as store from '../services/store.js';
import { TABLE_STATUSES } from '../utils/constants.js';

export function getAll(_req, res) {
  res.json({ success: true, data: store.getTables() });
}

export function update(req, res) {
  const tables = store.getTables();
  const t = tables.find((t) => t.id === req.params.id);
  if (!t) return res.status(404).json({ success: false, message: 'Table not found.' });

  if (req.body.status !== undefined) {
    if (!TABLE_STATUSES.includes(req.body.status)) {
      return res.status(400).json({ success: false, message: 'Invalid table status.' });
    }
    t.status = req.body.status;
  }
  if (req.body.name !== undefined && String(req.body.name).trim()) {
    t.name = String(req.body.name).trim();
  }

  store.setTables(tables);
  res.json({ success: true, data: t });
}
