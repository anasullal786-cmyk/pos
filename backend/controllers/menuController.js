import * as store from '../services/store.js';
import { CATEGORIES } from '../utils/constants.js';
import { isNonEmptyString, isNonNegativeNumber, result } from '../utils/validation.js';

export function getAll(_req, res) {
  res.json({ success: true, data: store.getMenu() });
}

export function create(req, res) {
  const { ok, errors } = validateMenuItem(req.body, { checkDuplicate: true });
  if (!ok) return res.status(400).json({ success: false, message: 'Invalid menu item.', errors });

  const b = req.body;
  const item = {
    id: `P${Date.now().toString(36)}${Math.floor(Math.random() * 1000)}`,
    name: String(b.name).trim(),
    category: b.category,
    price: Number(b.price),
    description: String(b.description || '').trim(),
    image: String(b.image || '').trim(),
    available: b.available !== false,
  };
  const menu = store.getMenu();
  menu.push(item);
  store.setMenu(menu);
  res.status(201).json({ success: true, data: item });
}

export function update(req, res) {
  const menu = store.getMenu();
  const idx = menu.findIndex((m) => m.id === req.params.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, message: 'Menu item not found.' });
  }

  const merged = { ...menu[idx], ...req.body, id: menu[idx].id };
  const { ok, errors } = validateMenuItem(merged, {
    checkDuplicate: true,
    excludeId: menu[idx].id,
  });
  if (!ok) return res.status(400).json({ success: false, message: 'Invalid menu item.', errors });

  merged.name = String(merged.name).trim();
  merged.price = Number(merged.price);
  merged.description = String(merged.description || '').trim();
  merged.image = String(merged.image || '').trim();
  merged.available = merged.available !== false;

  menu[idx] = merged;
  store.setMenu(menu);
  res.json({ success: true, data: merged });
}

export function remove(req, res) {
  const menu = store.getMenu();
  const exists = menu.some((m) => m.id === req.params.id);
  if (!exists) {
    return res.status(404).json({ success: false, message: 'Menu item not found.' });
  }
  store.setMenu(menu.filter((m) => m.id !== req.params.id));
  res.json({ success: true, data: { id: req.params.id } });
}

function validateMenuItem(b, { checkDuplicate = false, excludeId = null } = {}) {
  const errors = [];
  if (!isNonEmptyString(b.name)) errors.push('Menu item name is required.');
  if (!CATEGORIES.includes(b.category)) errors.push('A valid category is required.');
  if (!isNonNegativeNumber(b.price) || b.price <= 0) errors.push('Price must be a positive number.');
  if (b.available !== undefined && typeof b.available !== 'boolean') {
    errors.push('Available must be true or false.');
  }
  if (checkDuplicate && isNonEmptyString(b.name)) {
    const dup = store
      .getMenu()
      .find((m) => m.id !== excludeId && m.name.trim().toLowerCase() === String(b.name).trim().toLowerCase());
    if (dup) errors.push(`"${dup.name}" already exists in the menu.`);
  }
  return result(errors.length === 0, errors);
}
