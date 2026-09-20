import * as store from '../services/store.js';
import { DEFAULT_SETTINGS } from '../utils/constants.js';
import { isNonNegativeNumber } from '../utils/validation.js';

export function get(_req, res) {
  res.json({ success: true, data: store.getSettings() });
}

export function update(req, res) {
  const current = store.getSettings();
  const next = { ...current, ...req.body, id: undefined };
  delete next.id;

  if (!String(next.cafeName || '').trim()) {
    return res.status(400).json({ success: false, message: 'Café name is required.' });
  }
  if (!isNonNegativeNumber(Number(next.taxPercent)) || Number(next.taxPercent) < 0 || Number(next.taxPercent) > 100) {
    return res.status(400).json({ success: false, message: 'Tax must be between 0 and 100.' });
  }
  if (!isNonNegativeNumber(Number(next.defaultTableCount)) || Number(next.defaultTableCount) < 1) {
    return res.status(400).json({ success: false, message: 'Default table count must be at least 1.' });
  }

  next.taxPercent = Number(next.taxPercent);
  next.defaultTableCount = Number(next.defaultTableCount);
  next.currency = String(next.currency || DEFAULT_SETTINGS.currency).toUpperCase();
  next.currencySymbol = String(next.currencySymbol || DEFAULT_SETTINGS.currencySymbol);

  store.setSettings(next);
  res.json({ success: true, data: next });
}
