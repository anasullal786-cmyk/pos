/**
 * Supabase-backed data layer for the Café POS API.
 *
 * This is the ONLY module that talks to the database — controllers call
 * the async functions below and never see Supabase directly. Rows live
 * in snake_case Postgres columns and are mapped to the camelCase shapes
 * the REST API (and therefore the frontend) has always used, so the API
 * contract is unchanged:
 *
 *   menu_items → menu item   { id, name, category, price, description, image, available }
 *   orders     → order       { id, tableId, customerName, customerPhone, items, … }
 *   tables     → table       { id, name, status }
 *   settings   → settings    { cafeName, taxPercent, … }  (single row, id = 1)
 *
 * On first run (empty tables) the store seeds itself with the same
 * sample data the frontend uses. Settings are always merged over
 * DEFAULT_SETTINGS so newly added fields never come back undefined.
 */

import 'dotenv/config';
import { supabase } from './supabaseClient.js';
import { DEFAULT_SETTINGS } from '../utils/constants.js';

/* ---- helpers ------------------------------------------------------- */

/** Convert a Supabase/Postgres error into an Express-friendly error. */
function dbError(error) {
  const err = new Error(error?.message || 'Database error.');
  err.status = 500;
  err.publicMessage = 'Database error. Please try again.';
  return err;
}

const iso = (v) => (v ? new Date(v).toISOString() : null);

/* ---- row mappers (DB ↔ API) ----------------------------------------- */

const toMenuItem = (r) =>
  r && {
    id: r.id,
    name: r.name,
    category: r.category,
    price: Number(r.price),
    description: r.description ?? '',
    image: r.image ?? '',
    available: r.available,
  };

/** Pick only known menu columns (extra keys such as id-in-patch are dropped). */
const menuItemColumns = (m) => ({
  name: m.name,
  category: m.category,
  price: m.price,
  description: m.description ?? '',
  image: m.image ?? '',
  available: m.available !== false,
});

const toOrder = (r) =>
  r && {
    id: r.id,
    tableId: r.table_id,
    customerName: r.customer_name,
    customerPhone: r.customer_phone ?? '',
    items: r.items ?? [],
    subtotal: Number(r.subtotal),
    discount: Number(r.discount),
    tax: Number(r.tax),
    taxPercent: Number(r.tax_percent),
    total: Number(r.total),
    paymentMethod: r.payment_method,
    status: r.status,
    createdAt: iso(r.created_at),
    updatedAt: iso(r.updated_at),
  };

const orderColumns = (o) => ({
  table_id: o.tableId || null,
  customer_name: o.customerName,
  customer_phone: o.customerPhone ?? '',
  items: o.items ?? [],
  subtotal: o.subtotal,
  discount: o.discount,
  tax: o.tax,
  tax_percent: o.taxPercent,
  total: o.total,
  payment_method: o.paymentMethod,
  status: o.status,
  created_at: o.createdAt ? new Date(o.createdAt).toISOString() : undefined,
  updated_at: o.updatedAt ? new Date(o.updatedAt).toISOString() : undefined,
});

const toTable = (r) => r && { id: r.id, name: r.name, status: r.status };

const toSettings = (r) =>
  r && {
    cafeName: r.cafe_name,
    address: r.address,
    phone: r.phone,
    taxPercent: Number(r.tax_percent),
    currency: r.currency,
    currencySymbol: r.currency_symbol,
    receiptFooter: r.receipt_footer,
    defaultTableCount: Number(r.default_table_count),
  };

const settingsColumns = (s) => ({
  cafe_name: s.cafeName,
  address: s.address,
  phone: s.phone,
  tax_percent: s.taxPercent,
  currency: s.currency,
  currency_symbol: s.currencySymbol,
  receipt_footer: s.receiptFooter,
  default_table_count: s.defaultTableCount,
});

/* ---- initialization / seeding --------------------------------------- */

/**
 * Ensure the database has content: seed menu items and tables when the
 * corresponding tables are empty (first run or after a reset), and make
 * sure the settings row exists. Called once at server start.
 */
export async function initialize({ menu: seedMenu = [], tables: seedTables = [] } = {}) {
  let menu = await getMenu();
  let tables = await getTables();

  // Inserted one-by-one so created_at preserves the seed order.
  if (menu.length === 0 && seedMenu.length > 0) {
    for (const item of seedMenu) await insertMenuItem(item);
    menu = await getMenu();
    console.log(`[store] First run: seeded ${menu.length} menu items into Supabase.`);
  }
  if (tables.length === 0 && seedTables.length > 0) {
    for (const t of seedTables) await insertTable(t);
    tables = await getTables();
    console.log(`[store] First run: seeded ${tables.length} tables into Supabase.`);
  }

  await ensureSettingsRow();

  const orders = await getOrders();
  console.log(
    `[store] Supabase ready: ${menu.length} menu items, ${orders.length} orders, ${tables.length} tables.`
  );
}

/* ---- menu items ------------------------------------------------------ */

export async function getMenu() {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .order('created_at');
  if (error) throw dbError(error);
  return data.map(toMenuItem);
}

export async function getMenuItem(id) {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw dbError(error);
  return toMenuItem(data);
}

/** Case-insensitive name lookup; returns the duplicate row or null. */
export async function findMenuDuplicate(name, excludeId = null) {
  const escaped = String(name).trim().replace(/[%_\\]/g, '\\$&');
  const { data, error } = await supabase
    .from('menu_items')
    .select('id, name')
    .ilike('name', escaped);
  if (error) throw dbError(error);
  return (data || []).find((r) => r.id !== excludeId) || null;
}

export async function insertMenuItem(item) {
  const { data, error } = await supabase
    .from('menu_items')
    .insert({ id: item.id, ...menuItemColumns(item) })
    .select()
    .single();
  if (error) throw dbError(error);
  return toMenuItem(data);
}

export async function updateMenuItem(id, patch) {
  const { data, error } = await supabase
    .from('menu_items')
    .update(menuItemColumns(patch))
    .eq('id', id)
    .select()
    .maybeSingle();
  if (error) throw dbError(error);
  return toMenuItem(data); // null → no such row
}

export async function deleteMenuItem(id) {
  const { data, error } = await supabase
    .from('menu_items')
    .delete()
    .eq('id', id)
    .select()
    .maybeSingle();
  if (error) throw dbError(error);
  return toMenuItem(data); // null → no such row
}

/* ---- orders ----------------------------------------------------------- */

export async function getOrders() {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw dbError(error);
  return data.map(toOrder);
}

export async function getOrder(id) {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw dbError(error);
  return toOrder(data);
}

export async function insertOrder(order) {
  const { data, error } = await supabase
    .from('orders')
    .insert({ id: order.id, ...orderColumns(order) })
    .select()
    .single();
  if (error) throw dbError(error);
  return toOrder(data);
}

export async function updateOrder(id, patch) {
  const { data, error } = await supabase
    .from('orders')
    .update(orderColumns(patch))
    .eq('id', id)
    .select()
    .maybeSingle();
  if (error) throw dbError(error);
  return toOrder(data); // null → no such row
}

export async function deleteOrder(id) {
  const { data, error } = await supabase
    .from('orders')
    .delete()
    .eq('id', id)
    .select()
    .maybeSingle();
  if (error) throw dbError(error);
  return toOrder(data); // null → no such row
}

/* ---- tables ------------------------------------------------------------ */

export async function getTables() {
  const { data, error } = await supabase
    .from('tables')
    .select('*')
    .order('created_at');
  if (error) throw dbError(error);
  return data.map(toTable);
}

export async function getTable(id) {
  const { data, error } = await supabase
    .from('tables')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  if (error) throw dbError(error);
  return toTable(data);
}

export async function insertTable(t) {
  const { data, error } = await supabase
    .from('tables')
    .insert({ id: t.id, name: t.name, status: t.status || 'Available' })
    .select()
    .single();
  if (error) throw dbError(error);
  return toTable(data);
}

export async function updateTable(id, patch) {
  const cols = {};
  if (patch.status !== undefined) cols.status = patch.status;
  if (patch.name !== undefined) cols.name = patch.name;
  if (Object.keys(cols).length === 0) return getTable(id);

  const { data, error } = await supabase
    .from('tables')
    .update(cols)
    .eq('id', id)
    .select()
    .maybeSingle();
  if (error) throw dbError(error);
  return toTable(data); // null → no such row
}

/* ---- settings ----------------------------------------------------------- */

export async function getSettings() {
  const row = await fetchSettingsRow();
  return row ? toSettings(row) : { ...DEFAULT_SETTINGS };
}

async function fetchSettingsRow() {
  const { data, error } = await supabase
    .from('settings')
    .select('*')
    .eq('id', 1)
    .maybeSingle();
  if (error) throw dbError(error);
  return data;
}

async function ensureSettingsRow() {
  const row = await fetchSettingsRow();
  if (row) return row;
  const { data, error } = await supabase
    .from('settings')
    .upsert({ id: 1, ...settingsColumns(DEFAULT_SETTINGS) })
    .select()
    .single();
  if (error) throw dbError(error);
  return data;
}

export async function setSettings(s) {
  await ensureSettingsRow();
  const { data, error } = await supabase
    .from('settings')
    .update(settingsColumns(s))
    .eq('id', 1)
    .select()
    .single();
  if (error) throw dbError(error);
  return toSettings(data);
}

/* ---- reset ---------------------------------------------------------------- */

/**
 * Wipe every table and re-seed with the supplied demo data (used by
 * POST /api/reset). Orders are deleted first because they reference
 * tables; settings are restored to their defaults.
 */
export async function resetAll({ menu: seedMenu = [], tables: seedTables = [] } = {}) {
  for (const name of ['orders', 'menu_items', 'tables']) {
    const { error } = await supabase.from(name).delete().not('id', 'is', null);
    if (error) throw dbError(error);
  }
  for (const item of seedMenu) await insertMenuItem(item);
  for (const t of seedTables) await insertTable(t);
  await setSettings({ ...DEFAULT_SETTINGS });
  console.log('[store] All data wiped and re-seeded.');
}
