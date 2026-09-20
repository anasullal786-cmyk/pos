/**
 * First-launch seeding: fills localStorage with demo data when empty.
 * Idempotent — safe to call on every app start.
 */

import { STORAGE_KEYS, read, write } from '../utils/storage.js';
import { DEFAULT_SETTINGS } from './constants.js';
import { buildSeedMenu, buildTables } from './seed.js';

export function ensureSeedData() {
  if (!read(STORAGE_KEYS.menu)) {
    write(STORAGE_KEYS.menu, buildSeedMenu());
  }
  if (!read(STORAGE_KEYS.tables)) {
    write(STORAGE_KEYS.tables, buildTables(DEFAULT_SETTINGS.defaultTableCount));
  }
  if (!read(STORAGE_KEYS.orders)) {
    // Orders start empty — no sample orders are seeded.
    write(STORAGE_KEYS.orders, []);
  }
  if (!read(STORAGE_KEYS.settings)) {
    write(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
  }
}
