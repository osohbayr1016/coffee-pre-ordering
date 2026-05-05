type OnboardInput = {
  name: string;
  address: string;
  lat: number;
  lng: number;
  owner_email: string;
  owner_password: string;
  owner_display_name: string;
  menu_manager_email?: string;
  menu_manager_password?: string;
  menu_manager_display_name?: string;
  orders_manager_email?: string;
  orders_manager_password?: string;
  orders_manager_display_name?: string;
};

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

async function insertUser(
  db: D1Database,
  id: string,
  email: string,
  password: string,
  displayName: string,
  role: string
): Promise<void> {
  await db.prepare(`
    INSERT INTO users (id, email, role, password_hash, display_name)
    VALUES (?, ?, ?, ?, ?)
  `).bind(id, email, role, password, displayName).run();
}

async function rollbackUsers(db: D1Database, ids: string[]) {
  for (const id of [...ids].reverse()) {
    await db.prepare('DELETE FROM users WHERE id = ?').bind(id).run();
  }
}

export async function onboardShopWithTeam(
  db: D1Database,
  input: OnboardInput
): Promise<{ error: string; status: number } | { shop: Record<string, unknown> }> {
  const emails: string[] = [input.owner_email.trim()];
  const mm = input.menu_manager_email?.trim();
  const om = input.orders_manager_email?.trim();
  if (mm && input.menu_manager_password) emails.push(mm);
  if (om && input.orders_manager_password) emails.push(om);
  if (new Set(emails).size !== emails.length) {
    return { error: 'Each person needs a unique email', status: 400 };
  }

  for (const em of emails) {
    const row = await db.prepare('SELECT id FROM users WHERE email = ?').bind(em).first();
    if (row) return { error: `Email already registered: ${em}`, status: 409 };
  }

  const ownerId = crypto.randomUUID();
  const createdIds: string[] = [ownerId];
  const slug = slugify(input.name);
  let shopId: string | null = null;

  try {
    await insertUser(
      db,
      ownerId,
      input.owner_email.trim(),
      input.owner_password,
      input.owner_display_name.trim(),
      'shop_owner'
    );

    const shop = await db.prepare(`
      INSERT INTO coffee_shops (owner_id, name, slug, address, lat, lng)
      VALUES (?, ?, ?, ?, ?, ?)
      RETURNING *
    `).bind(ownerId, input.name.trim(), slug, input.address.trim(), input.lat, input.lng).first();

    if (!shop) {
      await rollbackUsers(db, createdIds);
      return { error: 'Failed to create shop', status: 500 };
    }

    shopId = shop.id as string;

    const addMgr = async (
      email: string | undefined,
      password: string | undefined,
      displayName: string | undefined,
      staffRole: 'menu_manager' | 'orders_manager'
    ) => {
      if (!email?.trim() || !password || !displayName?.trim()) return;
      const uid = crypto.randomUUID();
      await insertUser(db, uid, email.trim(), password, displayName.trim(), staffRole);
      createdIds.push(uid);
      await db.prepare(`
        INSERT INTO shop_staff (shop_id, user_id, staff_role)
        VALUES (?, ?, ?)
      `).bind(shopId!, uid, staffRole).run();
    };

    await addMgr(
      input.menu_manager_email,
      input.menu_manager_password,
      input.menu_manager_display_name,
      'menu_manager'
    );
    await addMgr(
      input.orders_manager_email,
      input.orders_manager_password,
      input.orders_manager_display_name,
      'orders_manager'
    );

    return { shop };
  } catch (e: unknown) {
    if (shopId) await db.prepare('DELETE FROM coffee_shops WHERE id = ?').bind(shopId).run();
    await rollbackUsers(db, createdIds);
    if (String(e).includes('UNIQUE')) {
      return { error: 'Shop slug already exists — pick a different name', status: 409 };
    }
    console.error('onboardShopWithTeam', e);
    return { error: 'Failed to onboard shop', status: 500 };
  }
}

export async function addShopStaffMember(
  db: D1Database,
  shopId: string,
  email: string,
  password: string,
  displayName: string,
  staffRole: 'menu_manager' | 'orders_manager'
): Promise<{ error: string; status: number } | { ok: true }> {
  const em = email.trim();
  const shop = await db.prepare('SELECT id FROM coffee_shops WHERE id = ?').bind(shopId).first();
  if (!shop) return { error: 'Shop not found', status: 404 };

  const dup = await db.prepare('SELECT id FROM users WHERE email = ?').bind(em).first();
  if (dup) return { error: 'Email already registered', status: 409 };

  const uid = crypto.randomUUID();
  try {
    await insertUser(db, uid, em, password, displayName.trim(), staffRole);
    await db.prepare(`
      INSERT INTO shop_staff (shop_id, user_id, staff_role)
      VALUES (?, ?, ?)
    `).bind(shopId, uid, staffRole).run();
    return { ok: true };
  } catch (e: unknown) {
    await db.prepare('DELETE FROM users WHERE id = ?').bind(uid).run();
    console.error('addShopStaffMember', e);
    return { error: 'Failed to add staff', status: 500 };
  }
}
