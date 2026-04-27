import { Hono } from 'hono';

type Bindings = {
  DB: D1Database;
};

export const adminRouter = new Hono<{ Bindings: Bindings }>();

adminRouter.get('/metrics', async (c) => {
  // Aggregate real stats
  const totalShopsResult = await c.env.DB.prepare('SELECT COUNT(*) as count FROM coffee_shops').first();
  const totalShops = totalShopsResult?.count || 0;

  // Active subscriptions (using trial or active as active)
  const activeSubsResult = await c.env.DB.prepare("SELECT COUNT(*) as count FROM coffee_shops WHERE subscription_status IN ('active', 'trial')").first();
  const activeSubs = activeSubsResult?.count || 0;

  // Total Orders today
  const today = new Date().toISOString().split('T')[0];
  const totalOrdersResult = await c.env.DB.prepare(`
    SELECT COUNT(*) as count FROM orders WHERE created_at LIKE ?
  `).bind(`${today}%`).first();
  const totalOrders = totalOrdersResult?.count || 0;

  // Revenue today
  const revenueResult = await c.env.DB.prepare(`
    SELECT SUM(total_amount) as total FROM orders WHERE created_at LIKE ? AND status != 'cancelled'
  `).bind(`${today}%`).first();
  const platformRevenue = (revenueResult?.total as number) || 0;

  return c.json({
    totalShops,
    activeSubs,
    totalOrders,
    platformRevenue
  });
});

adminRouter.get('/payouts', async (c) => {
  // Calculate payouts per shop based on real orders
  const payouts = await c.env.DB.prepare(`
    SELECT 
      s.id, 
      s.name, 
      IFNULL(SUM(o.total_amount), 0) as total_revenue
    FROM coffee_shops s
    LEFT JOIN orders o ON s.id = o.shop_id AND o.status != 'cancelled'
    GROUP BY s.id, s.name
    ORDER BY total_revenue DESC
  `).all();

  return c.json(payouts.results);
});

adminRouter.get('/heatmap', async (c) => {
  // Get shops with coordinates and their total orders
  const heatmapData = await c.env.DB.prepare(`
    SELECT 
      s.id, 
      s.name, 
      s.lat, 
      s.lng,
      COUNT(o.id) as order_count
    FROM coffee_shops s
    LEFT JOIN orders o ON s.id = o.shop_id
    WHERE s.lat IS NOT NULL AND s.lng IS NOT NULL
    GROUP BY s.id, s.name, s.lat, s.lng
  `).all();

  return c.json(heatmapData.results);
});
