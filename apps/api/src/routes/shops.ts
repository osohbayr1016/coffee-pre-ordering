import { Hono } from 'hono';

type Bindings = {
  DB: D1Database;
};

export const shopsRouter = new Hono<{ Bindings: Bindings }>();

// Get orders for a specific shop
shopsRouter.get('/:id/orders', async (c) => {
  const shopId = c.req.param('id');
  
  const orders = await c.env.DB.prepare(`
    SELECT o.id, o.status, o.total_amount, o.scheduled_pickup_at, o.created_at, o.pickup_code, u.display_name as customer_name
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

// We can add PUT routes later for updating menu items and orders
