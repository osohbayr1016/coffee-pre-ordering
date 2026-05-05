import { Hono } from 'hono';
import { requireCustomerJwt } from '../lib/jwt-auth';
import { createOrderFromCart } from '../lib/create-order';
import { duplicatePaidOrder } from '../lib/duplicate-paid-order';

type Bindings = {
  DB: D1Database;
  JWT_SECRET: string;
};

export const ordersRouter = new Hono<{ Bindings: Bindings }>();

ordersRouter.get('/recent', async (c) => {
  const customer = await requireCustomerJwt(c);
  if (!customer) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const recentOrder = await c.env.DB.prepare(`
      SELECT o.*, s.name as shop_name, s.slug as shop_slug
      FROM orders o
      JOIN coffee_shops s ON o.shop_id = s.id
      WHERE o.customer_id = ?
      ORDER BY o.created_at DESC
      LIMIT 1
    `).bind(customer.userId).first();

    if (!recentOrder) return c.json({ error: 'No recent orders found' }, 404);

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

ordersRouter.post('/', async (c) => {
  const customer = await requireCustomerJwt(c);
  if (!customer) return c.json({ error: 'Unauthorized' }, 401);

  const body = await c.req.json();
  const { shop_id, items, promo_code } = body;

  if (!shop_id || !Array.isArray(items)) {
    return c.json({ error: 'Missing shop_id or items' }, 400);
  }

  const shop = await c.env.DB.prepare(`SELECT id FROM coffee_shops WHERE id = ?`).bind(shop_id).first();
  if (!shop) return c.json({ error: 'Shop not found' }, 404);

  const result = await createOrderFromCart(
    c.env.DB,
    customer.userId,
    shop_id,
    items,
    promo_code
  );

  if ('error' in result) {
    const { error, status: st } = result as { error: string; status: number };
    const statusCode = st >= 500 ? 500 : 400;
    return c.json({ error }, statusCode);
  }

  return c.json(result);
});

ordersRouter.patch('/:id/status', async (c) => {
  const orderId = c.req.param('id');
  const body = await c.req.json();
  const { status } = body;

  if (!status) return c.json({ error: 'Missing status' }, 400);

  try {
    const row = await c.env.DB.prepare(`
      UPDATE orders SET status = ?, updated_at = datetime('now') WHERE id = ? RETURNING *
    `).bind(status, orderId).first();

    if (!row) return c.json({ error: 'Order not found' }, 404);
    return c.json(row);
  } catch (err) {
    console.error('Error updating order:', err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

ordersRouter.post('/:id/reorder', async (c) => {
  const customer = await requireCustomerJwt(c);
  if (!customer) return c.json({ error: 'Unauthorized' }, 401);

  try {
    const result = await duplicatePaidOrder(c.env.DB, customer.userId, c.req.param('id'));
    if ('error' in result) {
      const { error, status: st } = result as { error: string; status: number };
      return c.json({ error }, st as 400 | 403 | 404 | 500);
    }
    return c.json(result);
  } catch (err) {
    console.error('Error processing reorder:', err);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

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
