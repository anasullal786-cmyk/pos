/** Shared validation helpers for the frontend. Each returns { ok, errors }. */

export const result = (ok, errors = []) => ({ ok, errors });

export const isPositiveNumber = (v) =>
  typeof v === 'number' && Number.isFinite(v) && v > 0;

export const isNonNegativeNumber = (v) =>
  typeof v === 'number' && Number.isFinite(v) && v >= 0;

export const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;

/** Validate a menu item form payload. */
export function validateMenuItem(b) {
  const errors = [];
  if (!isNonEmptyString(b.name)) errors.push('Menu item name is required.');
  if (!isNonEmptyString(b.category)) errors.push('Please choose a category.');
  if (!isPositiveNumber(Number(b.price))) errors.push('Price must be a positive number.');
  return result(errors.length === 0, errors);
}

/** Validate settings payload. */
export function validateSettings(b) {
  const errors = [];
  if (!isNonEmptyString(b.cafeName)) errors.push('Café name is required.');
  const tax = Number(b.taxPercent);
  if (!Number.isFinite(tax) || tax < 0 || tax > 100) errors.push('Tax must be between 0 and 100.');
  const tables = Number(b.defaultTableCount);
  if (!Number.isInteger(tables) || tables < 1 || tables > 50) {
    errors.push('Default table count must be between 1 and 50.');
  }
  return result(errors.length === 0, errors);
}
