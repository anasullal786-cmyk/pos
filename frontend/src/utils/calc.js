/**
 * Single source of truth for order math — used by the cart, the POS
 * screen and the order details screen so totals can never diverge.
 */

export function calculateTotals({ items, discount = 0, taxPercent = 5 }) {
  const subtotal = +items.reduce((s, it) => s + Number(it.price) * Number(it.quantity), 0).toFixed(2);

  const safeDiscount = Math.min(Math.max(0, Number(discount) || 0), subtotal);
  const afterDiscount = subtotal - safeDiscount;
  const tax = +(afterDiscount * ((Number(taxPercent) || 0) / 100)).toFixed(2);
  const total = +(afterDiscount + tax).toFixed(2);

  const itemCount = items.reduce((s, it) => s + Number(it.quantity), 0);

  return { subtotal, discount: safeDiscount, tax, total, itemCount };
}

/** Merge-add a product into a cart line list (quantity bumps instead of duplicates). */
export function addLine(items, product, quantity = 1, notes = '') {
  const idx = items.findIndex((it) => it.productId === product.id && (it.notes || '') === (notes || ''));
  if (idx >= 0) {
    const next = [...items];
    next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity };
    return next;
  }
  return [
    ...items,
    {
      productId: product.id,
      name: product.name,
      price: product.price,
      quantity,
      notes: notes || '',
    },
  ];
}

/** Change a line's quantity; drops the line when it reaches 0. */
export function setLineQuantity(items, index, quantity) {
  if (quantity <= 0) return items.filter((_, i) => i !== index);
  return items.map((it, i) => (i === index ? { ...it, quantity } : it));
}

/** Update a line's notes. */
export function setLineNotes(items, index, notes) {
  return items.map((it, i) => (i === index ? { ...it, notes } : it));
}
