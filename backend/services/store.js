/**
 * In-memory data store with file-backed persistence.
 *
 * The store seeds itself with the same sample data the frontend uses,
 * serves it over REST, and keeps changes in memory while running.
 * Every mutation is also written to backend/data/cafe-pos-data.json so
 * all data survives backend restarts. If the backend is unavailable the
 * frontend transparently falls back to localStorage.
 *
 * This module is the only file that would change if the backend later
 * used SQLite/PostgreSQL — controllers already talk to it via functions.
 */

import { DEFAULT_SETTINGS } from '../utils/constants.js';
import { loadState, persist } from './persistence.js';

let menu = [];
let orders = [];
let tables = [];
let settings = { ...DEFAULT_SETTINGS };

/* ---- persistence helpers ------------------------------------------ */

/** Snapshot of the current state, used for saving to disk. */
function snapshot() {
  return { menu, orders, tables, settings };
}

/** Write current state to disk (fire-and-forget, errors are logged). */
function save() {
  persist(snapshot());
}

/* ---- public API ---------------------------------------------------- */

/** Load persisted state from disk; fall back to seed data on first run. */
export function initialize(seed) {
  const saved = loadState();
  if (saved) {
    if (Array.isArray(saved.menu)) menu = saved.menu;
    if (Array.isArray(saved.orders)) orders = saved.orders;
    if (Array.isArray(saved.tables)) tables = saved.tables;
    if (saved.settings) settings = { ...DEFAULT_SETTINGS, ...saved.settings };
    console.log(
      `[store] Loaded saved data: ${menu.length} menu items, ${orders.length} orders, ${tables.length} tables.`
    );
  } else {
    setState(seed);
    save();
    console.log('[store] First run: seeded fresh data (saved to disk).');
  }
}

export function getState() {
  return snapshot();
}

export function setState(next) {
  if (Array.isArray(next.menu)) menu = next.menu;
  if (Array.isArray(next.orders)) orders = next.orders;
  if (Array.isArray(next.tables)) tables = next.tables;
  if (next.settings) settings = { ...DEFAULT_SETTINGS, ...next.settings };
  save();
}

export const getMenu = () => [...menu];
export const setMenu = (list) => {
  menu = [...list];
  save();
};

export const getOrders = () => [...orders];
export const setOrders = (list) => {
  orders = [...list];
  save();
};

export const getTables = () => [...tables];
export const setTables = (list) => {
  tables = [...list];
  save();
};

export const getSettings = () => ({ ...settings });
export const setSettings = (s) => {
  settings = { ...DEFAULT_SETTINGS, ...s };
  save();
};
