# ☕ Café POS — Point of Sale & Order Management System

A complete, modern café POS built with **React + Vite + Tailwind CSS** on the frontend and
**Node.js + Express** on the backend. Data persists in **browser localStorage** and in a
**JSON data file on the backend** (`backend/data/cafe-pos-data.json`) — no external database —
served through a clean service layer so the storage engine can later be swapped for
SQLite/PostgreSQL without touching the UI.

---

## ✨ Features

- **Dashboard** — today's sales, order counts, average order value, pending/completed orders,
  popular items, 14-day sales chart, recent orders, quick actions.
- **POS / New Order** — two-column layout: searchable, category-filtered menu grid on the left;
  cart with quantity controls, per-item notes, discount, tax, payment method and totals on the right.
  Duplicate items merge into one cart line. Receipt modal after placing an order.
- **Tables** — 10 visual tables with Available / Occupied / Reserved color states, active-order
  shortcuts, manual status override.
- **Orders** — filter by status, search by order number/customer, detail view with a status
  pipeline (Pending → Preparing → Ready → Completed), cancel & delete with confirmation.
- **Menu Management** — add/edit/delete items, change price/category/description/image
  (upload from file, auto-resized & compressed to a data URL), enable/disable availability,
  duplicate detection.
- **Reports** — today/week/month sales, totals, average order value, best sellers, sales by
  category, payment-method breakdown, 14-day trend chart.
- **Receipts** — professional thermal-style receipt with café details, itemised totals and a
  Print Receipt button using browser printing (`window.print()` with print-only CSS).
- **Settings** — café name, address, phone, tax %, currency (default INR ₹ with Indian number
  formatting), receipt footer, default table count, and one-click demo-data reset.
- **Resilience** — the frontend talks to the REST API first; if the backend is unreachable it
  transparently falls back to localStorage, so the app is always functional.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+

### Install

```bash
# 1. Install root tooling (concurrently)
npm install

# 2. Install backend + frontend dependencies
npm run install:all
```

### Run (frontend + backend together)

```bash
npm run dev
```

- Frontend → http://localhost:3000
- Backend API → http://localhost:5000 (health check: `GET /api/health`)

Run them separately if you prefer:

```bash
npm run dev:server   # Express API only
npm run dev:client   # Vite frontend only
```

### Production build

```bash
npm run build        # builds the frontend into frontend/dist
npm run preview      # serve the built frontend locally
```

> The Vite dev server proxies `/api/*` to `http://localhost:5000`. In production, host the API
> and the built frontend behind the same origin (or set CORS and an absolute API base).

---

## 🏗 Architecture

```
cafe-pos/
├── package.json               # root scripts (concurrently)
├── README.md
├── backend/
│   ├── server.js              # Express entry, wires routes, seeds data
│   ├── routes/                # menuRoutes, orderRoutes, tableRoutes, miscRoutes
│   ├── controllers/           # menu, orders, tables, reports, settings
│   ├── services/
│   │   ├── store.js           # in-memory store, persisted to disk (swap for a DB later)
│   │   ├── persistence.js     # load/save the JSON data file on every mutation
│   │   ├── seed.js            # raw seed rows (menu/tables/orders)
│   │   └── seedData.js        # builds seeded records with ids
│   ├── middleware/errorHandler.js
│   ├── utils/                 # constants, validation
│   └── package.json
└── frontend/
    ├── index.html
    ├── vite.config.js         # React + Tailwind v4 plugins, /api proxy
    └── src/
        ├── main.jsx           # entry, seeds localStorage on first launch
        ├── App.jsx            # providers + routes
        ├── layouts/AppLayout.jsx
        ├── components/
        │   ├── layout/        # Sidebar, Header
        │   ├── pos/           # MenuCard, CategoryFilter, Cart, CartItem
        │   ├── orders/        # OrderCard
        │   ├── tables/        # TableCard
        │   ├── menu/          # MenuForm
        │   ├── receipt/       # Receipt
        │   ├── charts/        # SalesChart (BarChart, HBarList)
        │   └── ui/            # Modal, ConfirmDialog, Badge, StatCard,
        │                      # EmptyState, LoadingSpinner
        ├── pages/             # Dashboard, POS, Tables, Orders,
        │                      # OrderDetails, Menu, Reports, Settings
        ├── context/           # Cart, Menu, Orders, Tables, Settings, Toast
        ├── services/          # api.js (fetch client),
        │                      # dataService.js (API-first + localStorage fallback)
        ├── data/              # constants, seed.js, seedInit.js
        └── utils/             # storage.js, format.js, calc.js, validation.js, id.js
```

### Frontend ⇄ backend data flow

```
React page/component
      │  (context hook)
      ▼
context/  (Cart, Menu, Orders, Tables, Settings)
      │  calls
      ▼
services/dataService.js   ←── the ONLY data interface the UI knows
      │
      ├── 1. try REST API  (services/api.js → /api/...)
      └── 2. on network failure → localStorage via utils/storage.js
```

- Business logic (totals, validation, seeding) lives in **shared utils** on the frontend and in
  **controllers** on the backend; neither duplicates the other's transport concerns.
- The header shows a live pill: **“API connected”** (green) or **“Local mode”** (amber) so you
  always know which layer is serving data.

### REST API

| Method | Route                | Description                     |
|--------|----------------------|---------------------------------|
| GET    | `/api/health`        | Liveness check                  |
| GET    | `/api/menu`          | List menu items                 |
| POST   | `/api/menu`          | Create menu item                |
| PUT    | `/api/menu/:id`      | Update menu item                |
| DELETE | `/api/menu/:id`      | Delete menu item                |
| GET    | `/api/orders`        | List orders (`?status=&search=`)|
| GET    | `/api/orders/:id`    | Single order                    |
| POST   | `/api/orders`        | Create order (validates, updates table status) |
| PUT    | `/api/orders/:id`    | Update order/status             |
| DELETE | `/api/orders/:id`    | Delete order                    |
| GET    | `/api/tables`        | List tables                     |
| PUT    | `/api/tables/:id`    | Update table status/name        |
| GET    | `/api/reports`       | Aggregated sales statistics     |
| GET/PUT| `/api/settings`      | Café settings                   |

---

## 💾 localStorage structure

`frontend/src/utils/storage.js` is the **only** file that touches `localStorage`; components
never call it directly.

| Key              | Content                                        |
|------------------|------------------------------------------------|
| `cafe_menu`      | Array of menu items `{ id, name, category, price, description, image, available }` |
| `cafe_orders`    | Array of orders (structure below)              |
| `cafe_tables`    | Array `{ id, name, status }` (`T1`…`T10`)      |
| `cafe_settings`  | `{ cafeName, address, phone, taxPercent, currency, currencySymbol, receiptFooter, defaultTableCount }` |
| `cafe_active_cart` | In-progress cart (survives page refresh)     |

Order record:

```json
{
  "id": "ORD-1001",
  "tableId": "T1",
  "customerName": "Walk-in Customer",
  "items": [
    { "productId": "P1", "name": "Cappuccino", "price": 120, "quantity": 2, "notes": "Less sugar" }
  ],
  "subtotal": 240,
  "discount": 0,
  "tax": 12,
  "taxPercent": 5,
  "total": 252,
  "paymentMethod": "Cash",
  "status": "Pending",
  "createdAt": "2026-09-19T05:30:00.000Z",
  "updatedAt": "2026-09-19T05:35:00.000Z"
}
```

Service-layer functions (all `async`, API-first with fallback): `getMenu`, `addMenuItem`,
`updateMenuItem`, `deleteMenuItem`, `getOrders`, `getOrder`, `saveOrder`, `updateOrder`,
`deleteOrder`, `getTables`, `updateTableStatus`, `getReports`, `getSettings`, `saveSettings`,
`resetLocalData`, `pingBackend`.

Corrupt or missing values are handled gracefully — `read()` catches parse errors and returns a
fallback; missing keys trigger first-launch seeding (`data/seedInit.js`).

---

## 🔑 Sample data

Seeded automatically on first launch (and after a reset):

- **26 menu items** across Coffee, Tea, Cold Drinks, Snacks, Breakfast, Meals, Desserts with
  realistic INR prices (Espresso ₹80 … Margherita Pizza ₹250).
- **10 tables** (`T1`–`T10`).
- **13 sample orders** spread over the past week (completed + a few pending/preparing/ready) so
  dashboard and reports show meaningful numbers immediately.

**No authentication is implemented** — it's a counter POS prototype, so there is no login.
Add JWT/session auth later at the API layer plus a login route if needed.

---

## ♻️ Resetting demo data

- **In the app:** Settings → *Reset Demo Data* → confirm. Everything is wiped and re-seeded.
- **Manually:** DevTools → Application → Local Storage → delete the `cafe_*` keys, or run
  `localStorage.clear()` in the console, then refresh.

---

## ➕ Adding menu items

1. **Via UI:** Menu → *Add Item* → fill name/category/price (+ description, upload an image) → Save.
   Images are auto-resized (max 800px) and compressed to a JPEG data URL in the browser, so they
   work offline in localStorage and through the API without any file-storage setup.
   Use the availability badge to toggle items on/off the POS instantly.
2. **Via API:**
   ```bash
   curl -X POST http://localhost:5000/api/menu -H "Content-Type: application/json" \
     -d '{"name":"Caramel Latte","category":"Coffee","price":160,"description":"Sweet & creamy"}'
   ```
3. **Via code:** append to the raw list in `frontend/src/data/seed.js` /
   `backend/services/seed.js`, then reset demo data.

---

## 🗄 Migrating from localStorage to SQLite/PostgreSQL

The architecture is deliberately prepared for this:

1. **Backend:** replace the function bodies in `backend/services/store.js` with real SQL
   (better: use `better-sqlite3` / `pg` + a small query layer). Controllers already consume
   `store.getMenu()/setMenu()` etc., so **no controller or route changes** are needed.
2. **Frontend:** `services/dataService.js` already prefers the REST API. Once the backend is
   authoritative, delete (or keep as offline cache) the localStorage fallback branches — no page
   or context changes are required.
3. **Suggested schema (Postgres):**
   ```sql
   CREATE TABLE menu_items (
     id TEXT PRIMARY KEY, name TEXT NOT NULL, category TEXT NOT NULL,
     price NUMERIC(10,2) NOT NULL CHECK (price >= 0),
     description TEXT, image TEXT, available BOOLEAN DEFAULT TRUE
   );
   CREATE TABLE orders (
     id TEXT PRIMARY KEY, table_id TEXT, customer_name TEXT,
     subtotal NUMERIC(10,2), discount NUMERIC(10,2), tax NUMERIC(10,2),
     tax_percent NUMERIC(5,2), total NUMERIC(10,2),
     payment_method TEXT, status TEXT, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ
   );
   CREATE TABLE order_items (
     id SERIAL PRIMARY KEY, order_id TEXT REFERENCES orders(id) ON DELETE CASCADE,
     product_id TEXT, name TEXT, price NUMERIC(10,2), quantity INT CHECK (quantity > 0), notes TEXT
   );
   CREATE TABLE tables (
     id TEXT PRIMARY KEY, name TEXT, status TEXT CHECK (status IN ('Available','Occupied','Reserved'))
   );
   ```
4. Because all persistence flows through **one storage module** on each side, nothing else in
   the app changes.

---

## 🛠 Tech Stack

| Layer     | Tech                                                       |
|-----------|------------------------------------------------------------|
| Frontend  | React 18, Vite 6, React Router 6, Tailwind CSS 4, Lucide    |
| State     | React Context (Cart / Menu / Orders / Tables / Settings / Toast) |
| Backend   | Node.js, Express 4, CORS, dotenv                            |
| Storage   | localStorage (frontend) + JSON file on disk (backend)       |
| Charts    | Custom dependency-free SVG/div charts                       |

---

## 📄 Notes

- Default currency is **INR (₹)** with Indian digit grouping (e.g. ₹1,24,500.00).
- All monetary math is rounded to 2 decimals at each step to avoid float drift.
- Printing uses a dedicated `#receipt-print-area` with `@media print` CSS so only the receipt
  hits the paper.
