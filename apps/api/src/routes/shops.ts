import { Hono } from 'hono';

type Bindings = {
  DB: D1Database;
};

export const shopsRouter = new Hono<{ Bindings: Bindings }>();

// Get all shops (admin/discovery)
shopsRouter.get('/', async (c) => {
  const shops = await c.env.DB.prepare(`
    SELECT * FROM coffee_shops ORDER BY created_at DESC
  `).all();
  return c.json(shops.results);
});

// Create a new shop (admin onboarding)
shopsRouter.post('/', async (c) => {
  const body = await c.req.json();
  const { name, address, lat, lng } = body;
  
  if (!name || !address || lat === undefined || lng === undefined) {
    return c.json({ error: 'Missing required fields' }, 400);
  }
  
  // Generate a basic slug
  const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  
  // Find an existing user or create a dummy admin user
  let ownerId: string;
  const firstUser = await c.env.DB.prepare('SELECT id FROM users LIMIT 1').first();
  
  if (firstUser) {
    ownerId = firstUser.id as string;
  } else {
    // Generate a random ID for the dummy user
    ownerId = crypto.randomUUID();
    await c.env.DB.prepare(`
      INSERT INTO users (id, phone, email, display_name, role)
      VALUES (?, ?, ?, ?, ?)
    `).bind(ownerId, '00000000', 'admin@bonum.coffee', 'Admin User', 'admin').run();
  }
  
  try {
    const result = await c.env.DB.prepare(`
      INSERT INTO coffee_shops (owner_id, name, slug, address, lat, lng)
      VALUES (?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(ownerId, name, slug, address, lat, lng).first();
    
    return c.json(result);
  } catch (err: any) {
    if (err.message?.includes('UNIQUE constraint failed')) {
      return c.json({ error: 'Shop with similar name/slug already exists' }, 409);
    }
    console.error('Error creating shop:', err);
    return c.json({ error: 'Internal server error' }, 500);
  }
});

// Get orders for a specific shop
shopsRouter.get('/:id/orders', async (c) => {
  const shopId = c.req.param('id');
  
  const orders = await c.env.DB.prepare(`
    SELECT o.id, o.status, o.total_amount, o.scheduled_pickup_at, o.created_at, o.pickup_code, u.display_name as customer_name, u.allergy_profile
    FROM orders o
    JOIN users u ON o.customer_id = u.id
    WHERE o.shop_id = ?
    ORDER BY o.created_at DESC
    LIMIT 50
  `).bind(shopId).all();

  return c.json(orders.results);
});

// Get menu for a specific shop
shopsRouter.get('/:id/menu', async (c) => {
  const shopId = c.req.param('id');
  
  const menu = await c.env.DB.prepare(`
    SELECT id, name, category, price, temp_options, is_available, image_url, prep_time_mins
    FROM menu_items
    WHERE shop_id = ?
  `).bind(shopId).all();

  return c.json(menu.results);
});

// Create new menu item
shopsRouter.post('/:id/menu', async (c) => {
  const shopId = c.req.param('id');
  const body = await c.req.json();
  
  const { name, category, price, temp_options, image_url, prep_time_mins } = body;
  
  const result = await c.env.DB.prepare(`
    INSERT INTO menu_items (shop_id, name, category, price, temp_options, image_url, prep_time_mins)
    VALUES (?, ?, ?, ?, ?, ?, ?)
    RETURNING *
  `).bind(shopId, name, category, price, temp_options || 'both', image_url || '', prep_time_mins || 3).first();

  return c.json(result);
});

// Update menu item availability
shopsRouter.patch('/:id/menu/:itemId', async (c) => {
  const shopId = c.req.param('id');
  const itemId = c.req.param('itemId');
  const body = await c.req.json();
  
  if (body.is_available === undefined) {
    return c.json({ error: 'Missing is_available status' }, 400);
  }
  
  const result = await c.env.DB.prepare(`
    UPDATE menu_items SET is_available = ? WHERE id = ? AND shop_id = ? RETURNING *
  `).bind(body.is_available ? 1 : 0, itemId, shopId).first();
  
  return c.json(result);
});

// Get modifiers for a specific shop
shopsRouter.get('/:id/modifiers', async (c) => {
  const shopId = c.req.param('id');
  
  const modifiers = await c.env.DB.prepare(`
    SELECT id, name, extra_price, is_available
    FROM menu_modifiers
    WHERE shop_id = ?
    ORDER BY created_at ASC
  `).bind(shopId).all();

  return c.json(modifiers.results);
});

// Create new modifier
shopsRouter.post('/:id/modifiers', async (c) => {
  const shopId = c.req.param('id');
  const body = await c.req.json();
  const { name, extra_price } = body;
  
  const result = await c.env.DB.prepare(`
    INSERT INTO menu_modifiers (shop_id, name, extra_price)
    VALUES (?, ?, ?)
    RETURNING *
  `).bind(shopId, name, extra_price || 0).first();

  return c.json(result);
});

// Toggle modifier
shopsRouter.patch('/:id/modifiers/:modId', async (c) => {
  const shopId = c.req.param('id');
  const modId = c.req.param('modId');
  const body = await c.req.json();
  
  if (body.is_available === undefined) {
    return c.json({ error: 'Missing is_available status' }, 400);
  }
  
  const result = await c.env.DB.prepare(`
    UPDATE menu_modifiers SET is_available = ? WHERE id = ? AND shop_id = ? RETURNING *
  `).bind(body.is_available ? 1 : 0, modId, shopId).first();
  
  return c.json(result);
});

// Get single shop profile
shopsRouter.get('/:id', async (c) => {
  const shopId = c.req.param('id');
  const result = await c.env.DB.prepare(`SELECT * FROM coffee_shops WHERE id = ?`).bind(shopId).first();
  if (!result) return c.json({ error: 'Shop not found' }, 404);
  return c.json(result);
});

// Update shop profile/settings
shopsRouter.patch('/:id', async (c) => {
  const shopId = c.req.param('id');
  const body = await c.req.json();
  
  // Build dynamic update query based on provided fields
  const updates: string[] = [];
  const values: any[] = [];
  
  if (body.name !== undefined) { updates.push('name = ?'); values.push(body.name); }
  if (body.address !== undefined) { updates.push('address = ?'); values.push(body.address); }
  if (body.prep_time_mins !== undefined) { updates.push('prep_time_mins = ?'); values.push(body.prep_time_mins); }
  if (body.is_open !== undefined) { updates.push('is_open = ?'); values.push(body.is_open ? 1 : 0); }
  
  if (updates.length === 0) return c.json({ error: 'No fields to update' }, 400);
  
  values.push(shopId);
  
  const result = await c.env.DB.prepare(`
    UPDATE coffee_shops SET ${updates.join(', ')} WHERE id = ? RETURNING *
  `).bind(...values).first();
  
  return c.json(result);
});

// Get shop dashboard metrics
shopsRouter.get('/:id/metrics', async (c) => {
  const shopId = c.req.param('id');
  const today = new Date().toISOString().split('T')[0];
  
  const shopResult = await c.env.DB.prepare('SELECT is_open FROM coffee_shops WHERE id = ?').bind(shopId).first();
  
  const ordersResult = await c.env.DB.prepare(`
    SELECT COUNT(*) as count FROM orders WHERE shop_id = ? AND status = 'picked_up' AND created_at LIKE ?
  `).bind(shopId, `${today}%`).first();
  
  const revenueResult = await c.env.DB.prepare(`
    SELECT SUM(total_amount) as total FROM orders WHERE shop_id = ? AND status != 'cancelled' AND created_at LIKE ?
  `).bind(shopId, `${today}%`).first();

  return c.json({
    is_open: shopResult?.is_open === 1,
    completed_orders: ordersResult?.count || 0,
    today_revenue: revenueResult?.total || 0
  });
});
