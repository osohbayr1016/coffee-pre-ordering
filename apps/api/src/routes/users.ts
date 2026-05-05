import { Hono } from 'hono';
import { verifyBearer } from '../lib/jwt-auth';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

export const usersRouter = new Hono<{ Bindings: Bindings }>();

usersRouter.patch('/me/profile', async (c) => {
  const payload = await verifyBearer(c);
  if (!payload) return c.json({ error: 'Unauthorized' }, 401);

  const { allergy_profile } = await c.req.json();

  try {
    const result = await c.env.DB.prepare(`
      UPDATE users SET allergy_profile = ? WHERE id = ? RETURNING *
    `).bind(allergy_profile, payload.userId).first();

    if (!result) return c.json({ error: 'User not found' }, 404);
    return c.json(result);
  } catch (err) {
    console.error('Error updating profile:', err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

usersRouter.get('/me/profile', async (c) => {
  const payload = await verifyBearer(c);
  if (!payload) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const user = await c.env.DB.prepare('SELECT * FROM users WHERE id = ?').bind(payload.userId).first();
    if (!user) return c.json({ error: 'User not found' }, 404);
    return c.json(user);
  } catch (err) {
    console.error('Error fetching profile:', err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});
