import { Hono } from 'hono';
import { sign } from 'hono/jwt';

// We'll define the Hono app type so we have access to Bindings
type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

export const authRouter = new Hono<{ Bindings: Bindings }>();

authRouter.post('/login', async (c) => {
  const { email, password } = await c.req.json();
  
  if (!email || !password) {
    return c.json({ error: 'Email and password required' }, 400);
  }

  // 1. Fetch user from DB
  const user = await c.env.DB.prepare('SELECT id, role, password_hash FROM users WHERE email = ?')
    .bind(email)
    .first<{ id: string; role: string; password_hash: string }>();

  if (!user || user.password_hash !== password) {
    return c.json({ error: 'Invalid credentials' }, 401);
  }

  // 2. Fetch the shop id if they are a shop owner
  let shopId = null;
  if (user.role === 'shop_owner') {
    const shop = await c.env.DB.prepare('SELECT id FROM coffee_shops WHERE owner_id = ?')
      .bind(user.id)
      .first<{ id: string }>();
    if (shop) shopId = shop.id;
  }

  // 3. Create JWT
  const payload = {
    userId: user.id,
    role: user.role,
    shopId: shopId,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
  };
  
  // NOTE: Ensure JWT_SECRET is in .dev.vars
  const token = await sign(payload, c.env.JWT_SECRET || 'fallback_secret_for_local_dev');

  return c.json({ token, user: { id: user.id, role: user.role, shopId } });
});
