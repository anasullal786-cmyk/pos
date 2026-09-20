# ☕ Café POS — Point of Sale & Order Management System

A complete, modern café POS built with **React + Vite + Tailwind CSS** on the frontend and
**Node.js + Express** on the backend, persisting all data in **Supabase (managed PostgreSQL)**.
The frontend keeps a **localStorage fallback**, so the app still works whenever the backend is
unreachable — served through a clean service layer so the UI never cares where data lives.

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
- A free [Supabase](https://supabase.com) project

### Supabase setup (one time)

1. Create a project at [supabase.com](https://supabase.com) (or use an existing one).
2. Open **Dashboard → SQL Editor → New query**, paste the contents of
   `backend/supabase/schema.sql`, and run it. This creates the `menu_items`, `orders`,
   `tables` and `settings` tables (RLS enabled — only the backend's service key can access
   them).
3. Open **Project Settings → API** and copy the **Project URL** and the **service_role** key.
4. `cp backend/.env.example backend/.env`, then fill in:
   ```
   SUPABASE_URL=https://YOUR-PROJECT-REF.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-secret-key
   ```
5. Start the backend — on first run it seeds 26 menu items and 10 tables automatically.

> The **service_role key is server-side only**. It bypasses Row Level Security and must never
> be embedded in the frontend or committed to git (`backend/.env` is git-ignored).

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

### Deploy (Vercel)

The repo deploys to Vercel as a single project using the **Services** model (see `vercel.json`):
`frontend/` builds as a Vite static app, `backend/` runs as a Node service, and top-level
rewrites route `/api/*` to the backend and everything else to the SPA.

1. `npx vercel login`, then `npx vercel link`
2. Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to the project's environment variables
   (Production) — never commit them
3. `npx vercel --prod`

The backend initialises its Supabase connection lazily per instance, so it works both as a
long-running local server and on Vercel's managed infrastructure.

---

## 🏗 Architecture

```
cafe-pos/
├── package.json               # root scripts (concurrently)
├── README.md
├── backend/
│   ├── server.js              # Express entry, wires routes, connects to Supabase & seeds
│   ├── supabase/
│   │   └── schema.sql         # tables + indexes + RLS — run once in the SQL Editor
│   ├── routes/                # menuRoutes, orderRoutes, tableRoutes, miscRoutes
│   ├── controllers/           # menu, orders, tables, reports, settings
│   ├── services/
│   │   ├── store.js           # async Supabase data layer (the ONLY module that queries the DB)
│   │   ├── supabaseClient.js  # service-role Supabase client (reads backend/.env)
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

## 🗄 Database (Supabase)

The backend stores everything in Postgres. `backend/services/store.js` is the **only** module
that queries the database; controllers consume its async functions, so swapping the storage
engine again would not touch controllers or routes.

| Table        | Content                                                                 |
|--------------|-------------------------------------------------------------------------|
| `menu_items` | `{ id, name, category, price, description, image, available, created_at }` |
| `orders`     | Order rows with the item lines embedded as a `jsonb` `items` column     |
| `tables`     | `{ id, name, status, created_at }` (`T1`…`T10`)                         |
| `settings`   | Single row (`id = 1`) with café name, tax, currency, receipt footer, …  |

Columns are `snake_case` in Postgres and mapped to the API's `camelCase` shapes in the store,
so the REST contract above is unchanged. Row Level Security is enabled with **no public
policies**: the browser-facing anon key can do nothing directly — only the backend's
service_role key reaches the data.

Seeding happens automatically on first boot (empty tables) and after `POST /api/reset`:
26 menu items, 10 tables, default settings; orders always start empty.

---

## 💾 localStorage structure (offline fallback)

`frontend/src/utils/storage.js` is the **only** file that touches `localStorage`; components
never call it directly. The keys below are the **fallback cache** used when the backend is
unreachable — with Supabase connected, the REST API is the source of truth.

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

## 🛠 Tech Stack

| Layer     | Tech                                                       |
|-----------|------------------------------------------------------------|
| Frontend  | React 18, Vite 6, React Router 6, Tailwind CSS 4, Lucide    |
| State     | React Context (Cart / Menu / Orders / Tables / Settings / Toast) |
| Backend   | Node.js, Express 4, CORS, dotenv                            |
| Database  | Supabase (PostgreSQL) via `@supabase/supabase-js` (service role) |
| Fallback  | localStorage (frontend) when the API is unreachable         |
| Charts    | Custom dependency-free SVG/div charts                       |

---

## 📄 Notes

- Default currency is **INR (₹)** with Indian digit grouping (e.g. ₹1,24,500.00).
- All monetary math is rounded to 2 decimals at each step to avoid float drift.
- Printing uses a dedicated `#receipt-print-area` with `@media print` CSS so only the receipt
  hits the paper.
