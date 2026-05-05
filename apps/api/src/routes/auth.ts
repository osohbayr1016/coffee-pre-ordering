import { Hono } from 'hono';
import { sign } from 'hono/jwt';
import { handleBootstrapAdmin } from '../lib/bootstrap-platform-admin';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
  BOOTSTRAP_ADMIN_SECRET?: string;
};

export const authRouter = new Hono<{ Bindings: Bindings }>();

authRouter.post('/login', async (c) => {
  const { email, password } = await c.req.json();

  if (!email || !password) {
    return c.json({ error: 'Email and password required' }, 400);
  }

  const normalizedEmail = email.trim().toLowerCase();

  const user = await c.env.DB.prepare(
    'SELECT id, role, password_hash FROM users WHERE lower(email) = ?'
  )
    .bind(normalizedEmail)
    .first<{ id: string; role: string; password_hash: string | null }>();

  if (!user?.password_hash || user.password_hash !== password) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  let shopId = null;
  if (user.role === 'shop_owner') {
    const shop = await c.env.DB.prepare('SELECT id FROM coffee_shops WHERE owner_id = ?')
      .bind(user.id)
      .first<{ id: string }>();
    if (shop) shopId = shop.id;
  } else if (user.role === 'menu_manager' || user.role === 'orders_manager') {
    const row = await c.env.DB.prepare(
      'SELECT shop_id FROM shop_staff WHERE user_id = ? LIMIT 1'
    )
      .bind(user.id)
      .first<{ shop_id: string }>();
    if (row) shopId = row.shop_id;
  }

  const payload = {
    userId: user.id,
    role: user.role,
    shopId: shopId,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7,
  };

  const token = await sign(
    payload,
    c.env.JWT_SECRET || 'fallback_secret_for_local_dev',
    'HS256'
  );

  return c.json({ token, user: { id: user.id, role: user.role, shopId } });
});

authRouter.post('/bootstrap-admin', handleBootstrapAdmin);

authRouter.post('/bootstrap', async (c) => {
  const row = await c.env.DB.prepare(`
    INSERT INTO users (role, display_name)
    VALUES ('customer', 'Guest')
    RETURNING id
  `).first<{ id: string }>();

  if (!row?.id) return c.json({ error: 'Could not create session' }, 500);

  const payload = {
    userId: row.id,
    role: 'customer',
    shopId: null as string | null,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 365,
  };
  const token = await sign(
    payload,
    c.env.JWT_SECRET || 'fallback_secret_for_local_dev',
    'HS256'
  );
  return c.json({ token, user: { id: row.id } });
});
