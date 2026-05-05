CREATE TABLE IF NOT EXISTS shop_staff (
  id TEXT PRIMARY KEY DEFAULT (lower(hex(randomblob(16)))),
  shop_id TEXT NOT NULL REFERENCES coffee_shops(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  staff_role TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  UNIQUE(shop_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_shop_staff_shop ON shop_staff(shop_id);
CREATE INDEX IF NOT EXISTS idx_shop_staff_user ON shop_staff(user_id);

INSERT OR IGNORE INTO users (id, phone, email, role, password_hash, display_name)
VALUES ('user-platform-admin', '88888888', 'admin@bonum.coffee', 'admin', 'admin123', 'Platform Admin');
