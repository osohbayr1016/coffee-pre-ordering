-- Users
CREATE TABLE IF NOT EXISTS users (
  id           TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  phone        TEXT UNIQUE,
  email        TEXT UNIQUE,
  role         TEXT NOT NULL DEFAULT 'customer',
  password_hash TEXT,
  display_name TEXT,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Coffee Shops
CREATE TABLE IF NOT EXISTS coffee_shops (
  id                  TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  owner_id            TEXT NOT NULL REFERENCES users(id),
  name                TEXT NOT NULL,
  slug                TEXT NOT NULL UNIQUE,
  address             TEXT NOT NULL,
  qpay_merchant_id    TEXT,
  subscription_status TEXT NOT NULL DEFAULT 'trial',
  prep_time_mins      INTEGER NOT NULL DEFAULT 5,
  is_open             INTEGER NOT NULL DEFAULT 1,
  created_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Menu Items
CREATE TABLE IF NOT EXISTS menu_items (
  id           TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  shop_id      TEXT NOT NULL REFERENCES coffee_shops(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  category     TEXT NOT NULL DEFAULT 'coffee',
  price        INTEGER NOT NULL,
  temp_options TEXT NOT NULL DEFAULT 'both',
  image_url    TEXT,
  is_available INTEGER NOT NULL DEFAULT 1,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
  id                  TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  customer_id         TEXT NOT NULL REFERENCES users(id),
  shop_id             TEXT NOT NULL REFERENCES coffee_shops(id),
  status              TEXT NOT NULL DEFAULT 'pending_payment',
  total_amount        INTEGER NOT NULL,
  qpay_invoice_id     TEXT,
  payment_status      TEXT NOT NULL DEFAULT 'unpaid',
  scheduled_pickup_at TEXT NOT NULL,
  note                TEXT,
  created_at          TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at          TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Order Items
CREATE TABLE IF NOT EXISTS order_items (
  id             TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  order_id       TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  menu_item_id   TEXT NOT NULL REFERENCES menu_items(id),
  quantity       INTEGER NOT NULL DEFAULT 1,
  temperature    TEXT NOT NULL DEFAULT 'hot',
  customizations TEXT,
  unit_price     INTEGER NOT NULL
);

-- Subscriptions (BONUM)
CREATE TABLE IF NOT EXISTS subscriptions (
  id           TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  shop_id      TEXT NOT NULL REFERENCES coffee_shops(id),
  plan         TEXT NOT NULL DEFAULT 'starter',
  status       TEXT NOT NULL DEFAULT 'active',
  starts_at    TEXT NOT NULL,
  ends_at      TEXT,
  activated_by TEXT REFERENCES users(id),
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_orders_shop_id     ON orders(shop_id);
CREATE INDEX IF NOT EXISTS idx_orders_customer_id ON orders(customer_id);
CREATE INDEX IF NOT EXISTS idx_orders_status      ON orders(status);
CREATE INDEX IF NOT EXISTS idx_menu_shop_id       ON menu_items(shop_id);
CREATE INDEX IF NOT EXISTS idx_shops_slug         ON coffee_shops(slug);
