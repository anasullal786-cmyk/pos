/**
 * Service layer — the ONLY interface contexts/pages use for data.
 *
 * Pattern for every operation:
 *   1. Try the REST API.
 *   2. If the backend is unreachable (network/timeout), transparently
 *      fall back to localStorage so the app stays fully functional.
 *   3. Real API errors (400/404/…) are re-thrown for the UI to display.
 *
 * Swapping localStorage for SQLite/PostgreSQL later means pointing this
 * file at the real API — no page or component changes required.
 */

import { api, ApiError } from './api.js';
import {
  STORAGE_KEYS,
  read,
  write,
  remove as removeKey,
} from '../utils/storage.js';
import { uid } from '../utils/id.js';
import { calculateTotals } from '../utils/calc.js';
import { ORDER_STATUSES, TABLE_STATUSES } from '../data/constants.js';

const isOfflineError = (err) => err instanceof ApiError && err.offline;

/*
 * Mirror helpers: whenever a mutation succeeds through the API we also
 * update the localStorage copy. That way, if the backend later goes down,
 * the local fallback reflects everything the staff did in API mode.
 */
const mirrorList = (key, updater) => {
  const list = read(key, []);
  const next = updater(list);
  write(key, next);
};

const mirrorMenuAdd = (item) => mirrorList(STORAGE_KEYS.menu, (list) => [...list, item]);
const mirrorMenuUpdate = (item) =>
  mirrorList(STORAGE_KEYS.menu, (list) => list.map((m) => (m.id === item.id ? item : m)));
const mirrorMenuDelete = (id) =>
  mirrorList(STORAGE_KEYS.menu, (list) => list.filter((m) => m.id !== id));

const mirrorOrderAdd = (order) => mirrorList(STORAGE_KEYS.orders, (list) => [order, ...list]);
const mirrorOrderUpdate = (order) =>
  mirrorList(STORAGE_KEYS.orders, (list) => list.map((o) => (o.id === order.id ? order : o)));
const mirrorOrderDelete = (id) =>
  mirrorList(STORAGE_KEYS.orders, (list) => list.filter((o) => o.id !== id));

const mirrorTableUpdate = (table) =>
  mirrorList(STORAGE_KEYS.tables, (list) => list.map((t) => (t.id === table.id ? table : t)));

/* ------------------------------------------------------------------ */
/* Menu                                                                */
/* ------------------------------------------------------------------ */

export async function getMenu() {
  try {
    const res = await api.get('/menu');
    return res.data;
  } catch (err) {
    if (!isOfflineError(err)) throw err;
    return read(STORAGE_KEYS.menu, []);
  }
}

export async function addMenuItem(item) {
  try {
    const res = await api.post('/menu', item);
    mirrorMenuAdd(res.data);
    return res.data;
  } catch (err) {
    if (!isOfflineError(err)) throw err;
    const menu = read(STORAGE_KEYS.menu, []);
    const created = {
      id: uid('P'),
      name: item.name,
      category: item.category,
      price: Number(item.price),
      description: item.description || '',
      image: item.image || '',
      available: item.available !== false,
    };
    write(STORAGE_KEYS.menu, [...menu, created]);
    return created;
  }
}

export async function updateMenuItem(id, patch) {
  try {
    const res = await api.put(`/menu/${id}`, patch);
    mirrorMenuUpdate(res.data);
    return res.data;
  } catch (err) {
    if (!isOfflineError(err)) throw err;
    const menu = read(STORAGE_KEYS.menu, []);
    const idx = menu.findIndex((m) => m.id === id);
    if (idx === -1) throw new ApiError('Menu item not found.', { status: 404 });
    const merged = { ...menu[idx], ...patch, id };
    merged.price = Number(merged.price);
    merged.available = merged.available !== false;
    menu[idx] = merged;
    write(STORAGE_KEYS.menu, menu);
    return merged;
  }
}

export async function deleteMenuItem(id) {
  try {
    await api.delete(`/menu/${id}`);
    mirrorMenuDelete(id);
    return { id };
  } catch (err) {
    if (!isOfflineError(err)) throw err;
    const menu = read(STORAGE_KEYS.menu, []);
    write(STORAGE_KEYS.menu, menu.filter((m) => m.id !== id));
    return { id };
  }
}

/* ------------------------------------------------------------------ */
/* Orders                                                              */
/* ------------------------------------------------------------------ */

export async function getOrders() {
  try {
    const res = await api.get('/orders');
    return res.data;
  } catch (err) {
    if (!isOfflineError(err)) throw err;
    const orders = read(STORAGE_KEYS.orders, []);
    return [...orders].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }
}

export async function getOrder(id) {
  try {
    const res = await api.get(`/orders/${id}`);
    return res.data;
  } catch (err) {
    if (!isOfflineError(err)) throw err;
    const order = read(STORAGE_KEYS.orders, []).find((o) => o.id === id);
    if (!order) throw new ApiError('Order not found.', { status: 404 });
    return order;
  }
}

/**
 * Create an order. `totals` comes from calculateTotals() on the cart so
 * frontend and backend math always agree.
 */
export async function saveOrder(orderInput, totals, taxPercent) {
  const payload = {
    tableId: orderInput.tableId || null,
    customerName: orderInput.customerName || 'Walk-in Customer',
    customerPhone: String(orderInput.customerPhone || '').trim(),
    items: orderInput.items,
    discount: orderInput.discount || 0,
    taxPercent,
    paymentMethod: orderInput.paymentMethod,
    status: orderInput.status || 'Pending',
  };

  try {
    const res = await api.post('/orders', payload);
    mirrorOrderAdd(res.data);
    return res.data;
  } catch (err) {
    if (!isOfflineError(err)) throw err;

    // ---- localStorage fallback ----
    const orders = read(STORAGE_KEYS.orders, []);
    const t = calculateTotals({
      items: payload.items,
      discount: payload.discount,
      taxPercent,
    });
    const order = {
      id: `ORD-${Date.now().toString().slice(-6)}${Math.floor(Math.random() * 90 + 10)}`,
      ...payload,
      subtotal: t.subtotal,
      discount: t.discount,
      tax: t.tax,
      total: t.total,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    write(STORAGE_KEYS.orders, [...orders, order]);

    // Occupy the table locally, mirroring backend behaviour.
    if (order.tableId && !['Completed', 'Cancelled'].includes(order.status)) {
      const tables = read(STORAGE_KEYS.tables, []);
      const table = tables.find((tb) => tb.id === order.tableId);
      if (table) table.status = 'Occupied';
      write(STORAGE_KEYS.tables, tables);
    }
    return order;
  }
}

export async function updateOrder(id, patch) {
  try {
    const res = await api.put(`/orders/${id}`, patch);
    mirrorOrderUpdate(res.data);
    return res.data;
  } catch (err) {
    if (!isOfflineError(err)) throw err;

    const orders = read(STORAGE_KEYS.orders, []);
    const idx = orders.findIndex((o) => o.id === id);
    if (idx === -1) throw new ApiError('Order not found.', { status: 404 });

    const prev = orders[idx];
    const merged = { ...prev, ...patch, id, createdAt: prev.createdAt };
    if (patch.items || patch.discount !== undefined || patch.taxPercent !== undefined) {
      const t = calculateTotals({
        items: merged.items,
        discount: merged.discount,
        taxPercent: merged.taxPercent,
      });
      Object.assign(merged, { subtotal: t.subtotal, discount: t.discount, tax: t.tax, total: t.total });
    }
    merged.updatedAt = new Date().toISOString();
    orders[idx] = merged;
    write(STORAGE_KEYS.orders, orders);

    syncTablesAfterStatusChange(prev, merged);
    return merged;
  }
}

export async function deleteOrder(id) {
  try {
    await api.delete(`/orders/${id}`);
    mirrorOrderDelete(id);
    return { id };
  } catch (err) {
    if (!isOfflineError(err)) throw err;

    const orders = read(STORAGE_KEYS.orders, []);
    const order = orders.find((o) => o.id === id);
    write(STORAGE_KEYS.orders, orders.filter((o) => o.id !== id));
    if (order) syncTablesAfterStatusChange(order, { ...order, status: 'Cancelled' });
    return { id };
  }
}

/** Keep table statuses consistent with order states (local mode). */
function syncTablesAfterStatusChange(prev, next) {
  const activeStatuses = ['Pending', 'Preparing', 'Ready'];
  const tables = read(STORAGE_KEYS.tables, []);
  let changed = false;

  const freeTable = (tableId) => {
    const hasActive = read(STORAGE_KEYS.orders, []).some(
      (o) =>
        o.tableId === tableId &&
        activeStatuses.includes(o.status) &&
        o.id !== next.id
    );
    const t = tables.find((tb) => tb.id === tableId);
    if (t && !hasActive && t.status === 'Occupied') {
      t.status = 'Available';
      changed = true;
    }
  };

  if (prev.tableId && prev.tableId !== next.tableId) {
    freeTable(prev.tableId);
  }
  const t = tables.find((tb) => tb.id === next.tableId);
  if (t) {
    if (['Completed', 'Cancelled'].includes(next.status)) {
      freeTable(next.tableId);
    } else if (activeStatuses.includes(next.status) && t.status === 'Available') {
      t.status = 'Occupied';
      changed = true;
    }
  }
  if (changed) write(STORAGE_KEYS.tables, tables);
}

/* ------------------------------------------------------------------ */
/* Tables                                                              */
/* ------------------------------------------------------------------ */

export async function getTables() {
  try {
    const res = await api.get('/tables');
    return res.data;
  } catch (err) {
    if (!isOfflineError(err)) throw err;
    return read(STORAGE_KEYS.tables, []);
  }
}

export async function updateTableStatus(id, status) {
  if (!TABLE_STATUSES.includes(status)) {
    throw new ApiError('Invalid table status.', { status: 400 });
  }
  try {
    const res = await api.put(`/tables/${id}`, { status });
    mirrorTableUpdate(res.data);
    return res.data;
  } catch (err) {
    if (!isOfflineError(err)) throw err;
    const tables = read(STORAGE_KEYS.tables, []);
    const t = tables.find((tb) => tb.id === id);
    if (!t) throw new ApiError('Table not found.', { status: 404 });
    t.status = status;
    write(STORAGE_KEYS.tables, tables);
    return t;
  }
}

/* ------------------------------------------------------------------ */
/* Reports                                                             */
/* ------------------------------------------------------------------ */

/**
 * Reports are always computed from stored orders. When the backend is
 * offline we recompute locally with the same logic (see computeReports).
 */
export async function getReports() {
  try {
    const res = await api.get('/reports');
    return res.data;
  } catch (err) {
    if (!isOfflineError(err)) throw err;
    return computeReports(
      read(STORAGE_KEYS.orders, []),
      read(STORAGE_KEYS.menu, [])
    );
  }
}

export function computeReports(orders, menu) {
  const valid = (orders || []).filter((o) => o.status !== 'Cancelled');
  const sum = (list) => list.reduce((s, o) => s + (Number(o.total) || 0), 0);
  const isToday = (iso) => new Date(iso).toDateString() === new Date().toDateString();
  const withinDays = (iso, days) =>
    new Date(iso).getTime() >= Date.now() - days * 24 * 60 * 60 * 1000;

  const todayOrders = valid.filter((o) => isToday(o.createdAt));
  const weekOrders = valid.filter((o) => withinDays(o.createdAt, 7));
  const monthOrders = valid.filter((o) => withinDays(o.createdAt, 30));

  const itemMap = new Map();
  const catMap = new Map();
  const payMap = new Map();
  for (const o of valid) {
    for (const it of o.items || []) {
      const cur = itemMap.get(it.name) || { name: it.name, quantity: 0, revenue: 0 };
      cur.quantity += it.quantity;
      cur.revenue += it.price * it.quantity;
      itemMap.set(it.name, cur);

      const product = (menu || []).find((m) => m.id === it.productId);
      const cat = product ? product.category : 'Other';
      const catCur = catMap.get(cat) || { category: cat, quantity: 0, revenue: 0 };
      catCur.quantity += it.quantity;
      catCur.revenue += it.price * it.quantity;
      catMap.set(cat, catCur);
    }
    const payCur = payMap.get(o.paymentMethod) || { method: o.paymentMethod, count: 0, revenue: 0 };
    payCur.count += 1;
    payCur.revenue += Number(o.total) || 0;
    payMap.set(o.paymentMethod, payCur);
  }

  const trend = [];
  for (let i = 13; i >= 0; i--) {
    const day = new Date();
    day.setDate(day.getDate() - i);
    const key = day.toDateString();
    const dayOrders = valid.filter((o) => new Date(o.createdAt).toDateString() === key);
    trend.push({
      date: day.toISOString().slice(0, 10),
      label: day.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }),
      revenue: +sum(dayOrders).toFixed(2),
      orders: dayOrders.length,
    });
  }

  return {
    todaySales: +sum(todayOrders).toFixed(2),
    todayOrders: todayOrders.length,
    weekSales: +sum(weekOrders).toFixed(2),
    monthSales: +sum(monthOrders).toFixed(2),
    totalOrders: valid.length,
    completedOrders: valid.filter((o) => o.status === 'Completed').length,
    pendingOrders: (orders || []).filter((o) =>
      ['Pending', 'Preparing', 'Ready'].includes(o.status)
    ).length,
    averageOrderValue: valid.length ? +(sum(valid) / valid.length).toFixed(2) : 0,
    bestSellers: [...itemMap.values()].sort((a, b) => b.quantity - a.quantity).slice(0, 8),
    salesByCategory: [...catMap.values()].sort((a, b) => b.revenue - a.revenue),
    paymentBreakdown: [...payMap.values()].sort((a, b) => b.revenue - a.revenue),
    trend,
  };
}

/* ------------------------------------------------------------------ */
/* Settings                                                            */
/* ------------------------------------------------------------------ */

export async function getSettings() {
  try {
    const res = await api.get('/settings');
    return res.data;
  } catch (err) {
    if (!isOfflineError(err)) throw err;
    return read(STORAGE_KEYS.settings, null);
  }
}

export async function saveSettings(settings) {
  try {
    const res = await api.put('/settings', settings);
    write(STORAGE_KEYS.settings, res.data);
    return res.data;
  } catch (err) {
    if (!isOfflineError(err)) throw err;
    write(STORAGE_KEYS.settings, settings);
    return settings;
  }
}

/* ------------------------------------------------------------------ */
/* Maintenance                                                         */
/* ------------------------------------------------------------------ */

/** Wipe all local data (used by "Reset demo data" in Settings). */
export function resetLocalData() {
  removeKey(STORAGE_KEYS.menu);
  removeKey(STORAGE_KEYS.orders);
  removeKey(STORAGE_KEYS.tables);
  removeKey(STORAGE_KEYS.settings);
}

/**
 * Also reset the backend (re-seeds its store and wipes its saved data
 * file). Best-effort: silently ignored when the backend is offline.
 */
export async function resetServerData() {
  try {
    await api.post('/reset', {});
    return true;
  } catch {
    return false;
  }
}

/** Check backend availability for the header status pill. */
export async function pingBackend() {
  try {
    await api.get('/health');
    return true;
  } catch {
    return false;
  }
}

export { ORDER_STATUSES };
