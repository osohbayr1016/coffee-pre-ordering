type LineInput = {
  menu_item_id: string;
  quantity: number;
  temperature?: string;
};

function resolvedTemperature(
  tempOptions: string,
  requested?: string
): 'hot' | 'cold' {
  const wantCold = requested?.toLowerCase() === 'cold';
  if (tempOptions === 'cold') return 'cold';
  if (tempOptions === 'hot') return 'hot';
  return wantCold ? 'cold' : 'hot';
}

export async function createOrderFromCart(
  db: D1Database,
  customerId: string,
  shopId: string,
  lines: LineInput[],
  promoCode: string | null | undefined
): Promise<{ error: string; status: number } | Record<string, unknown>> {
  if (!lines?.length) return { error: 'Cart is empty', status: 400 };

  let subtotal = 0;
  const rows: {
    menu_item_id: string;
    quantity: number;
    temperature: 'hot' | 'cold';
    unit_price: number;
  }[] = [];

  for (const line of lines) {
    const qty = Math.min(99, Math.max(1, Math.floor(Number(line.quantity)) || 1));
    const menuItem = await db.prepare(`
      SELECT id, price, temp_options, is_available
      FROM menu_items
      WHERE id = ? AND shop_id = ?
    `).bind(line.menu_item_id, shopId).first<{
      id: string;
      price: number;
      temp_options: string;
      is_available: number;
    }>();

    if (!menuItem) return { error: 'Invalid menu item', status: 400 };
    if (!menuItem.is_available) return { error: `Unavailable: ${menuItem.id}`, status: 400 };

    const temperature = resolvedTemperature(menuItem.temp_options, line.temperature);
    subtotal += menuItem.price * qty;
    rows.push({
      menu_item_id: menuItem.id,
      quantity: qty,
      temperature,
      unit_price: menuItem.price,
    });
  }

  let totalAmount = subtotal;
  if (promoCode?.trim().toUpperCase() === 'FIRSTCOFFEE50') {
    totalAmount = Math.floor(subtotal * 0.5);
  }

  const pickupTime = new Date(Date.now() + 15 * 60000).toISOString();

  const order = await db.prepare(`
    INSERT INTO orders (customer_id, shop_id, status, total_amount, payment_status, scheduled_pickup_at)
    VALUES (?, ?, 'paid', ?, 'paid', ?)
    RETURNING *
  `).bind(customerId, shopId, totalAmount, pickupTime).first();

  if (!order) return { error: 'Failed to create order', status: 500 };

  const orderId = order.id as string;
  for (const r of rows) {
    await db.prepare(`
      INSERT INTO order_items (order_id, menu_item_id, quantity, temperature, unit_price)
      VALUES (?, ?, ?, ?, ?)
    `).bind(orderId, r.menu_item_id, r.quantity, r.temperature, r.unit_price).run();
  }

  return order;
}
