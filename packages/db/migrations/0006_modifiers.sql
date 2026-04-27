-- Menu Modifiers (Global per shop)
CREATE TABLE IF NOT EXISTS menu_modifiers (
  id           TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  shop_id      TEXT NOT NULL REFERENCES coffee_shops(id) ON DELETE CASCADE,
  name         TEXT NOT NULL,
  extra_price  INTEGER NOT NULL DEFAULT 0,
  is_available INTEGER NOT NULL DEFAULT 1,
  created_at   TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_modifiers_shop_id ON menu_modifiers(shop_id);
