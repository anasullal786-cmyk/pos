/**
 * Central storage utility — the ONLY file that touches localStorage.
 *
 * Every module (services, contexts) goes through these helpers so the
 * persistence mechanism can later be swapped for SQLite/PostgreSQL via
 * a REST API without touching the rest of the app.
 */

const PREFIX = 'cafe_';

export const STORAGE_KEYS = {
  menu: `${PREFIX}menu`,
  orders: `${PREFIX}orders`,
  tables: `${PREFIX}tables`,
  settings: `${PREFIX}settings`,
};

/** Safely read and parse a key. Returns fallback on missing/corrupt data. */
export function read(key, fallback = null) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn(`[storage] Could not read "${key}", using fallback.`, err);
    return fallback;
  }
}

/** Safely serialize and write a key. */
export function write(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (err) {
    console.error(`[storage] Could not write "${key}".`, err);
    return false;
  }
}

/** Remove a key. */
export function remove(key) {
  try {
    window.localStorage.removeItem(key);
  } catch (err) {
    console.warn(`[storage] Could not remove "${key}".`, err);
  }
}

/** Remove every café key (used by "Reset demo data"). */
export function clearAll() {
  Object.values(STORAGE_KEYS).forEach(remove);
}
