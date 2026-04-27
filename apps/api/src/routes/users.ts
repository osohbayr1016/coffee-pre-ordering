import { Hono } from 'hono';

type Bindings = {
  DB: D1Database;
};

export const usersRouter = new Hono<{ Bindings: Bindings }>();

// Update user profile (Allergy & Taste)
usersRouter.patch('/me/profile', async (c) => {
  // Normally use JWT auth user ID here. For demo, we update a mock 'customer-1' or grab the first user.
  const { allergy_profile } = await c.req.json();

  try {
    // For demo: grab the first user in the system to act as our logged-in customer
    const user = await c.env.DB.prepare('SELECT id FROM users LIMIT 1').first<{id: string}>();
    if (!user) return c.json({ error: 'No user found' }, 404);

    const result = await c.env.DB.prepare(`
      UPDATE users SET allergy_profile = ? WHERE id = ? RETURNING *
    `).bind(allergy_profile, user.id).first();

    return c.json(result);
  } catch (err) {
    console.error('Error updating profile:', err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

// Get user profile
usersRouter.get('/me/profile', async (c) => {
  try {
    const user = await c.env.DB.prepare('SELECT * FROM users LIMIT 1').first();
    return c.json(user);
  } catch (err) {
    console.error('Error fetching profile:', err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});
