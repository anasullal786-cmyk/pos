/**
 * Shared validation helpers used by controllers. Every helper returns a
 * boolean so it can be combined freely; user-facing messages are built
 * where they are used.
 */

export const isNonEmptyString = (v) => typeof v === 'string' && v.trim().length > 0;

export const isNonNegativeNumber = (v) =>
  typeof v === 'number' && Number.isFinite(v) && v >= 0;

export const isNonNegativeInteger = (v) =>
  Number.isInteger(v) && v >= 0;

export const isPositiveInteger = (v) =>
  Number.isInteger(v) && v > 0;

/** Build an { ok, errors } result object. */
export const result = (ok, errors = []) => ({ ok, errors });
