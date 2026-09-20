-- =====================================================================
-- Café POS — Supabase (Postgres) schema
--
-- Run this once in the Supabase Dashboard → SQL Editor → New query.
-- Tables are created with IF NOT EXISTS so it is safe to re-run.
--
-- Row Level Security is enabled on every table with NO public policies:
-- the anon/public API is locked out, while the Express backend (which
-- connects with the service_role key) bypasses RLS and has full access.
-- =====================================================================

-- ---------------------------------------------------------------- tables
create table if not exists public.tables (
  id         text primary key,                    -- T1 .. T10
  name       text not null,
  status     text not null default 'Available'
             check (status in ('Available', 'Occupied', 'Reserved')),
  created_at timestamptz not null default now()
);

-- ------------------------------------------------------------ menu_items
create table if not exists public.menu_items (
  id          text primary key,                   -- P1 .. / generated
  name        text not null,
  category    text not null,
  price       numeric(10,2) not null check (price >= 0),
  description text not null default '',
  image       text not null default '',           -- URL or data URL
  available   boolean not null default true,
  created_at  timestamptz not null default now()
);

-- ---------------------------------------------------------------- orders
create table if not exists public.orders (
  id             text primary key,                 -- ORD-123456
  table_id       text references public.tables (id) on delete set null,
  customer_name  text not null default 'Walk-in Customer',
  customer_phone text not null default '',
  items          jsonb not null default '[]'::jsonb,
  subtotal       numeric(10,2) not null default 0,
  discount       numeric(10,2) not null default 0,
  tax            numeric(10,2) not null default 0,
  tax_percent    numeric(5,2)  not null default 5,
  total          numeric(10,2) not null default 0,
  payment_method text not null,
  status         text not null
                 check (status in ('Pending', 'Preparing', 'Ready', 'Completed', 'Cancelled')),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

create index if not exists orders_created_at_idx on public.orders (created_at desc);
create index if not exists orders_status_idx     on public.orders (status);

-- -------------------------------------------------------------- settings
-- Single row (id = 1) holding the café settings.
create table if not exists public.settings (
  id                  integer primary key default 1 check (id = 1),
  cafe_name           text not null default 'The Daily Grind Café',
  address             text not null default '',
  phone               text not null default '',
  tax_percent         numeric(5,2) not null default 5,
  currency            text not null default 'INR',
  currency_symbol     text not null default '₹',
  receipt_footer      text not null default '',
  default_table_count integer not null default 10
);

-- --------------------------------------------------------------- locking
-- RLS on, zero policies: only the service_role key (the backend) can
-- read/write. The browser-facing anon key can do nothing directly.
alter table public.tables    enable row level security;
alter table public.menu_items enable row level security;
alter table public.orders     enable row level security;
alter table public.settings   enable row level security;
