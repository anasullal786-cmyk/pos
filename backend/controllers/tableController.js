import * as store from '../services/store.js';
import { TABLE_STATUSES } from '../utils/constants.js';

export async function getAll(_req, res) {
  res.json({ success: true, data: await store.getTables() });
}

export async function update(req, res) {
  if (req.body.status !== undefined && !TABLE_STATUSES.includes(req.body.status)) {
    return res.status(400).json({ success: false, message: 'Invalid table status.' });
  }

  const patch = {};
  if (req.body.status !== undefined) patch.status = req.body.status;
  if (req.body.name !== undefined && String(req.body.name).trim()) {
    patch.name = String(req.body.name).trim();
  }

  const updated = await store.updateTable(req.params.id, patch);
  if (!updated) return res.status(404).json({ success: false, message: 'Table not found.' });
  res.json({ success: true, data: updated });
}
