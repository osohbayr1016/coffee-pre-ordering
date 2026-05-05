import { Hono } from 'hono';
import { requireAdminJwt } from '../lib/jwt-auth';
import { onboardShopWithTeam, addShopStaffMember } from '../lib/admin-shop-team';

type Bindings = { DB: D1Database; JWT_SECRET: string };

export const adminShopsRouter = new Hono<{ Bindings: Bindings }>();

adminShopsRouter.post('/', async (c) => {
  if (!(await requireAdminJwt(c))) return c.json({ error: 'Unauthorized' }, 401);

  const body = await c.req.json();
  const required = ['name', 'address', 'lat', 'lng', 'owner_email', 'owner_password', 'owner_display_name'];
  for (const k of required) {
    if (body[k] === undefined || body[k] === '') {
      return c.json({ error: `Missing field: ${k}` }, 400);
    }
  }

  const lat = Number(body.lat);
  const lng = Number(body.lng);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return c.json({ error: 'Invalid coordinates' }, 400);
  }

  const result = await onboardShopWithTeam(c.env.DB, {
    name: String(body.name),
    address: String(body.address),
    lat,
    lng,
    owner_email: String(body.owner_email),
    owner_password: String(body.owner_password),
    owner_display_name: String(body.owner_display_name),
    menu_manager_email: body.menu_manager_email,
    menu_manager_password: body.menu_manager_password,
    menu_manager_display_name: body.menu_manager_display_name,
    orders_manager_email: body.orders_manager_email,
    orders_manager_password: body.orders_manager_password,
    orders_manager_display_name: body.orders_manager_display_name,
  });

  if ('error' in result) {
    const st = result.status as 400 | 409 | 500;
    return c.json({ error: result.error }, st);
  }

  return c.json(result.shop);
});

adminShopsRouter.get('/:shopId/team', async (c) => {
  if (!(await requireAdminJwt(c))) return c.json({ error: 'Unauthorized' }, 401);

  const shopId = c.req.param('shopId');
  const shop = await c.env.DB.prepare('SELECT * FROM coffee_shops WHERE id = ?').bind(shopId).first();
  if (!shop) return c.json({ error: 'Shop not found' }, 404);

  const owner = await c.env.DB.prepare(
    'SELECT id, email, display_name, role FROM users WHERE id = ?'
  ).bind(shop.owner_id).first();

  const managers = await c.env.DB.prepare(`
    SELECT u.id, u.email, u.display_name, ss.staff_role
    FROM shop_staff ss
    JOIN users u ON u.id = ss.user_id
    WHERE ss.shop_id = ?
    ORDER BY ss.created_at ASC
  `).bind(shopId).all();

  return c.json({ shop, owner, managers: managers.results });
});

adminShopsRouter.post('/:shopId/managers', async (c) => {
  if (!(await requireAdminJwt(c))) return c.json({ error: 'Unauthorized' }, 401);

  const shopId = c.req.param('shopId');
  const body = await c.req.json();
  const { email, password, display_name, staff_role } = body;

  if (!email || !password || !display_name || !staff_role) {
    return c.json({ error: 'Missing email, password, display_name, or staff_role' }, 400);
  }

  if (staff_role !== 'menu_manager' && staff_role !== 'orders_manager') {
    return c.json({ error: 'staff_role must be menu_manager or orders_manager' }, 400);
  }

  const result = await addShopStaffMember(
    c.env.DB,
    shopId,
    email,
    password,
    display_name,
    staff_role
  );

  if ('error' in result) {
    return c.json({ error: result.error }, result.status as 404 | 409 | 500);
  }

  return c.json({ success: true });
});
