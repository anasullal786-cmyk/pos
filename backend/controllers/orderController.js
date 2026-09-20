import * as store from '../services/store.js';
import { PAYMENT_METHODS, ORDER_STATUSES } from '../utils/constants.js';
import {
  isNonEmptyString,
  isNonNegativeNumber,
  isNonNegativeInteger,
  isPositiveInteger,
  result,
} from '../utils/validation.js';

export function getAll(req, res) {
  let orders = store.getOrders();
  const { status, search } = req.query;

  if (status && ORDER_STATUSES.includes(status)) {
    orders = orders.filter((o) => o.status === status);
  }
  if (search) {
    const q = String(search).toLowerCase();
    orders = orders.filter(
      (o) => o.id.toLowerCase().includes(q) || String(o.customerName || '').toLowerCase().includes(q)
    );
  }

  orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json({ success: true, data: orders });
}

export function getOne(req, res) {
  const order = store.getOrders().find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
  res.json({ success: true, data: order });
}

export function create(req, res) {
  const { ok, errors, order } = validateOrder(req.body);
  if (!ok) return res.status(400).json({ success: false, message: 'Could not create order.', errors });

  const orders = store.getOrders();
  orders.push(order);
  store.setOrders(orders);

  // Occupying a table: only when the order is not yet closed.
  if (order.tableId && !['Completed', 'Cancelled'].includes(order.status)) {
    const tables = store.getTables();
    const t = tables.find((t) => t.id === order.tableId);
    if (t) t.status = 'Occupied';
    store.setTables(tables);
  }

  res.status(201).json({ success: true, data: order });
}

export function update(req, res) {
  const orders = store.getOrders();
  const idx = orders.findIndex((o) => o.id === req.params.id);
  if (idx === -1) return res.status(404).json({ success: false, message: 'Order not found.' });

  const prev = orders[idx];
  const merged = { ...prev, ...req.body, id: prev.id, createdAt: prev.createdAt };
  const { ok, errors } = validateOrder(merged, { partial: true });
  if (!ok) return res.status(400).json({ success: false, message: 'Could not update order.', errors });

  merged.updatedAt = new Date().toISOString();
  orders[idx] = merged;
  store.setOrders(orders);

  syncTableStatus(prev, merged);
  res.json({ success: true, data: merged });
}

export function remove(req, res) {
  const orders = store.getOrders();
  const order = orders.find((o) => o.id === req.params.id);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });

  store.setOrders(orders.filter((o) => o.id !== req.params.id));
  if (order.tableId && order.status !== 'Completed' && order.status !== 'Cancelled') {
    freeTableIfNoActiveOrders(order.tableId);
  }
  res.json({ success: true, data: { id: req.params.id } });
}

/** A table is occupied only while it has pending/preparing/ready orders. */
function syncTableStatus(prev, next) {
  const statusChanged =
    prev.status !== next.status || (prev.tableId || '') !== (next.tableId || '');
  if (!statusChanged) return;

  const tables = store.getTables();
  const activeStatuses = ['Pending', 'Preparing', 'Ready'];

  if (prev.tableId && prev.tableId !== next.tableId) {
    freeTableIfNoActiveOrders(prev.tableId, next.id);
  }

  const t = tables.find((t) => t.id === next.tableId);
  if (t) {
    if (['Completed', 'Cancelled'].includes(next.status)) {
      freeTableIfNoActiveOrders(t.id, next.id);
    } else if (activeStatuses.includes(next.status)) {
      t.status = 'Occupied';
    }
  }
  store.setTables(tables);
}

function freeTableIfNoActiveOrders(tableId, excludeOrderId = null) {
  const hasActive = store
    .getOrders()
    .some(
      (o) =>
        o.tableId === tableId &&
        !['Completed', 'Cancelled'].includes(o.status) &&
        o.id !== excludeOrderId
    );
  const t = store.getTables().find((t) => t.id === tableId);
  if (t && !hasActive) t.status = 'Available';
}

function validateOrder(b, { partial = false } = {}) {
  const errors = [];

  if (!Array.isArray(b.items) || b.items.length === 0) {
    errors.push('Please add at least one item.');
  } else {
    b.items.forEach((it, i) => {
      const label = `Item ${i + 1}`;
      if (!isNonEmptyString(it.productId)) errors.push(`${label}: product id is required.`);
      if (!isNonEmptyString(it.name)) errors.push(`${label}: name is required.`);
      if (!isNonNegativeNumber(it.price) || it.price <= 0) errors.push(`${label}: invalid price.`);
      if (!isPositiveInteger(it.quantity)) errors.push(`${label}: quantity must be at least 1.`);
      if (it.notes !== undefined && typeof it.notes !== 'string') errors.push(`${label}: notes must be text.`);
    });
  }

  if (!PAYMENT_METHODS.includes(b.paymentMethod)) errors.push('Please select a valid payment method.');
  if (!ORDER_STATUSES.includes(b.status)) errors.push('Invalid order status.');
  if (b.customerName !== undefined && !isNonEmptyString(b.customerName)) {
    errors.push('Customer name cannot be empty.');
  }
  if (
    b.customerPhone !== undefined &&
    b.customerPhone !== null &&
    String(b.customerPhone).trim() !== '' &&
    !/^[+\d][\d\s\-()]{5,19}$/.test(String(b.customerPhone).trim())
  ) {
    errors.push('Contact number must be a valid phone number (digits, spaces, - and ( ).');
  }

  if (errors.length) return result(false, errors);

  const subtotal = +b.items.reduce((s, it) => s + it.price * it.quantity, 0).toFixed(2);
  const discount = Math.min(+Number(b.discount || 0).toFixed(2), subtotal);
  if (!isNonNegativeNumber(b.discount || 0)) errors.push('Invalid discount.');
  const tax = +((subtotal - discount) * (Number(b.taxPercent ?? 5) / 100)).toFixed(2);
  if (!isNonNegativeNumber(b.taxPercent ?? 5)) errors.push('Invalid tax.');

  if (errors.length) return result(false, errors);

  const order = {
    id: b.id || `ORD-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`,
    tableId: b.tableId || null,
    customerName: String(b.customerName || 'Walk-in Customer').trim() || 'Walk-in Customer',
    customerPhone: String(b.customerPhone || '').trim(),
    items: b.items.map((it) => ({
      productId: it.productId,
      name: it.name,
      price: it.price,
      quantity: it.quantity,
      notes: it.notes || '',
    })),
    subtotal,
    discount,
    tax,
    taxPercent: Number(b.taxPercent ?? 5),
    total: +(subtotal - discount + tax).toFixed(2),
    paymentMethod: b.paymentMethod,
    status: b.status,
    createdAt: b.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  return { ok: true, errors: [], order };
}
