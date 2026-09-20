import * as store from '../services/store.js';
import { CATEGORIES } from '../utils/constants.js';
import { isNonEmptyString, isNonNegativeNumber, result } from '../utils/validation.js';

export async function getAll(_req, res) {
  res.json({ success: true, data: await store.getMenu() });
}

export async function create(req, res) {
  const { ok, errors } = await validateMenuItem(req.body, { checkDuplicate: true });
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
  const created = await store.insertMenuItem(item);
  res.status(201).json({ success: true, data: created });
}

export async function update(req, res) {
  const existing = await store.getMenuItem(req.params.id);
  if (!existing) {
    return res.status(404).json({ success: false, message: 'Menu item not found.' });
  }

  const merged = { ...existing, ...req.body, id: existing.id };
  const { ok, errors } = await validateMenuItem(merged, {
    checkDuplicate: true,
    excludeId: existing.id,
  });
  if (!ok) return res.status(400).json({ success: false, message: 'Invalid menu item.', errors });

  merged.name = String(merged.name).trim();
  merged.price = Number(merged.price);
  merged.description = String(merged.description || '').trim();
  merged.image = String(merged.image || '').trim();
  merged.available = merged.available !== false;

  const updated = await store.updateMenuItem(existing.id, merged);
  res.json({ success: true, data: updated });
}

export async function remove(req, res) {
  const deleted = await store.deleteMenuItem(req.params.id);
  if (!deleted) {
    return res.status(404).json({ success: false, message: 'Menu item not found.' });
  }
  res.json({ success: true, data: { id: req.params.id } });
}

async function validateMenuItem(b, { checkDuplicate = false, excludeId = null } = {}) {
  const errors = [];
  if (!isNonEmptyString(b.name)) errors.push('Menu item name is required.');
  if (!CATEGORIES.includes(b.category)) errors.push('A valid category is required.');
  if (!isNonNegativeNumber(b.price) || b.price <= 0) errors.push('Price must be a positive number.');
  if (b.available !== undefined && typeof b.available !== 'boolean') {
    errors.push('Available must be true or false.');
  }
  if (checkDuplicate && isNonEmptyString(b.name)) {
    const dup = await store.findMenuDuplicate(String(b.name), excludeId);
    if (dup) errors.push(`"${dup.name}" already exists in the menu.`);
  }
  return result(errors.length === 0, errors);
}
