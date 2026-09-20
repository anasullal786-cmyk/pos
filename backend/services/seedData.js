/**
 * Builds fully-formed seed records (with ids) from the raw SEED_MENU list.
 * Used by the backend at boot; the frontend mirrors this via its own
 * seed module since it cannot import across package boundaries.
 */

import { SEED_MENU } from './seed.js';

export function buildSeedMenu() {
  return SEED_MENU.map((item, i) => ({
    id: `P${i + 1}`,
    name: item.name,
    category: item.category,
    price: item.price,
    description: item.description || '',
    image: item.image || '',
    available: item.available !== false,
  }));
}
