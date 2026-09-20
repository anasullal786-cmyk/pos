/**
 * File-based persistence for the in-memory store.
 *
 * Every mutation in store.js triggers persist() which writes the whole
 * state to backend/data/cafe-pos-data.json. On boot the state is loaded
 * from that file (if it exists), so menu items, orders, tables and
 * settings survive backend restarts.
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '..', 'data');
const DATA_FILE = path.join(DATA_DIR, 'cafe-pos-data.json');

/** Load persisted state from disk. Returns null when no file exists yet. */
export function loadState() {
  try {
    if (!fs.existsSync(DATA_FILE)) return null;
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return parsed;
  } catch (err) {
    console.error('[persistence] Could not read data file, starting fresh.', err.message);
    return null;
  }
}

/** Write the current state to disk (atomic-ish: write tmp, then rename). */
export function persist(state) {
  try {
    if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
    const tmp = `${DATA_FILE}.tmp`;
    fs.writeFileSync(tmp, JSON.stringify(state, null, 2), 'utf-8');
    fs.renameSync(tmp, DATA_FILE);
  } catch (err) {
    console.error('[persistence] Could not save data file.', err.message);
  }
}
