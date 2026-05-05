/** Duplicate order rows as a new paid order (kitchen demo flow). */
export async function duplicatePaidOrder(
  db: D1Database,
  customerId: string,
  oldOrderId: string
): Promise<{ error: string; status: number } | Record<string, unknown>> {
  const oldOrder = await db.prepare('SELECT * FROM orders WHERE id = ?').bind(oldOrderId).first();
  if (!oldOrder) return { error: 'Order not found', status: 404 };
  if (oldOrder.customer_id !== customerId) return { error: 'Forbidden', status: 403 };

  const oldItems = await db.prepare('SELECT * FROM order_items WHERE order_id = ?').bind(oldOrderId).all();
  const pickupTime = new Date(Date.now() + 15 * 60000).toISOString();

  const newOrder = await db.prepare(`
    INSERT INTO orders (customer_id, shop_id, status, total_amount, payment_status, scheduled_pickup_at)
    VALUES (?, ?, ?, ?, ?, ?)
    RETURNING *
  `).bind(
    oldOrder.customer_id,
    oldOrder.shop_id,
    'paid',
    oldOrder.total_amount,
    'paid',
    pickupTime
  ).first();

  if (newOrder && oldItems.results.length > 0) {
    for (const item of oldItems.results) {
      await db.prepare(`
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

  return newOrder || { error: 'Failed to create order', status: 500 };
}
