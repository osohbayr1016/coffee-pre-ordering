import { Hono } from 'hono';

type Bindings = {
  DB: D1Database;
};

export const ordersRouter = new Hono<{ Bindings: Bindings }>();

// Update order status
ordersRouter.patch('/:id/status', async (c) => {
  const orderId = c.req.param('id');
  const body = await c.req.json();
  const { status } = body;

  if (!status) {
    return c.json({ error: 'Missing status' }, 400);
  }

  try {
    const result = await c.env.DB.prepare(`
      UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ? RETURNING *
    `).bind(status, orderId).first();

    if (!result) return c.json({ error: 'Order not found' }, 404);
    return c.json(result);
  } catch (err) {
    console.error('Error updating order:', err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

// Get order by ID (for live tracking)
ordersRouter.get('/:id', async (c) => {
  const orderId = c.req.param('id');
  
  try {
    const order = await c.env.DB.prepare(`
      SELECT o.*, s.name as shop_name, s.lat as shop_lat, s.lng as shop_lng
      FROM orders o
      JOIN coffee_shops s ON o.shop_id = s.id
      WHERE o.id = ?
    `).bind(orderId).first();
    
    if (!order) return c.json({ error: 'Order not found' }, 404);
    
    const items = await c.env.DB.prepare(`
      SELECT oi.*, m.name 
      FROM order_items oi
      JOIN menu_items m ON oi.menu_item_id = m.id
      WHERE oi.order_id = ?
    `).bind(orderId).all();
    
    return c.json({ ...order, items: items.results });
  } catch (err) {
    console.error('Error fetching order:', err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

// Get most recent order for the "1-Click Routine" feature
ordersRouter.get('/recent', async (c) => {
  // Normally this would use c.get('userId') from JWT auth.
  // For demo, we just get the most recent order in the entire DB.
  try {
    const recentOrder = await c.env.DB.prepare(`
      SELECT o.*, s.name as shop_name, s.slug as shop_slug
      FROM orders o
      JOIN coffee_shops s ON o.shop_id = s.id
      ORDER BY o.created_at DESC
      LIMIT 1
    `).first();

    if (!recentOrder) {
      return c.json({ error: 'No recent orders found' }, 404);
    }

    const items = await c.env.DB.prepare(`
      SELECT oi.*, m.name
      FROM order_items oi
      JOIN menu_items m ON oi.menu_item_id = m.id
      WHERE oi.order_id = ?
    `).bind(recentOrder.id).all();

    return c.json({ ...recentOrder, items: items.results });
  } catch (err) {
    console.error('Error fetching recent order:', err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

// 1-Click Reorder
ordersRouter.post('/:id/reorder', async (c) => {
  const oldOrderId = c.req.param('id');

  try {
    // Fetch old order
    const oldOrder = await c.env.DB.prepare('SELECT * FROM orders WHERE id = ?').bind(oldOrderId).first();
    if (!oldOrder) return c.json({ error: 'Order not found' }, 404);

    // Fetch old items
    const oldItems = await c.env.DB.prepare('SELECT * FROM order_items WHERE order_id = ?').bind(oldOrderId).all();

    // Create new order (Status PAID for demo so it goes straight to Kitchen)
    const pickupTime = new Date(Date.now() + 15 * 60000).toISOString(); // 15 mins from now
    
    const newOrder = await c.env.DB.prepare(`
      INSERT INTO orders (customer_id, shop_id, status, total_amount, payment_status, scheduled_pickup_at)
      VALUES (?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(
      oldOrder.customer_id, 
      oldOrder.shop_id, 
      'paid', // auto paid for quick reorder
      oldOrder.total_amount, 
      'paid', 
      pickupTime
    ).first();

    // Insert items
    if (newOrder && oldItems.results.length > 0) {
      for (const item of oldItems.results) {
        await c.env.DB.prepare(`
          INSERT INTO order_items (order_id, menu_item_id, quantity, temperature, unit_price)
          VALUES (?, ?, ?, ?, ?)
        `).bind(
          newOrder.id,
          item.menu_item_id,
          item.quantity,
          item.temperature,
          item.unit_price
        ).run();
      }
    }

    return c.json(newOrder);
  } catch (err) {
    console.error('Error processing reorder:', err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});
