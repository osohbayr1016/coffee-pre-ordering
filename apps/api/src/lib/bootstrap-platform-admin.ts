import type { Context } from 'hono';

type BootstrapBody = {
  secret?: string;
  email?: string;
  password?: string;
  display_name?: string;
  reset_password?: boolean;
};

export async function handleBootstrapAdmin(c: Context): Promise<Response> {
  const body = (await c.req.json().catch(() => ({}))) as BootstrapBody;

  const provided = body.secret ?? c.req.header('X-Bootstrap-Secret') ?? '';
  const env = c.env as {
    DB: D1Database;
    JWT_SECRET: string;
    BOOTSTRAP_ADMIN_SECRET?: string;
  };

  const explicit = env.BOOTSTRAP_ADMIN_SECRET;
  const expected =
    explicit && explicit.length > 0 ? explicit : env.JWT_SECRET || '';

  if (!expected || expected === 'fallback_secret_for_local_dev') {
    return c.json(
      {
        error:
          'Bootstrap disabled: set JWT_SECRET (production value) or BOOTSTRAP_ADMIN_SECRET.',
      },
      503
    );
  }

  if (!provided || provided !== expected) {
    return c.json({ error: 'Forbidden' }, 403);
  }

  const adminCount = await env.DB.prepare(
    `SELECT COUNT(*) as n FROM users WHERE role = 'admin'`
  ).first<{ n: number }>();

  const n = adminCount?.n ?? 0;

  if (body.reset_password === true) {
    if (n !== 1) {
      return c.json(
        { error: 'reset_password requires exactly one admin row in D1.' },
        400
      );
    }
    const pwd = body.password;
    if (!pwd || typeof pwd !== 'string') {
      return c.json({ error: 'password is required when reset_password is true' }, 400);
    }
    const adm = await env.DB.prepare(
      `SELECT id, email FROM users WHERE role = 'admin' LIMIT 1`
    ).first<{ id: string; email: string | null }>();
    if (!adm?.email) {
      return c.json({ error: 'Admin row has no email' }, 500);
    }
    const want = (body.email ?? adm.email).trim().toLowerCase();
    if (adm.email.trim().toLowerCase() !== want) {
      return c.json({ error: 'email does not match the admin account' }, 400);
    }
    await env.DB.prepare(`UPDATE users SET password_hash = ? WHERE id = ?`)
      .bind(pwd, adm.id)
      .run();
    return c.json({
      ok: true,
      reset: true,
      email: want,
      message: 'Password updated. POST /v1/auth/login.',
    });
  }

  if (n > 0) {
    return c.json(
      {
        error:
          'Admin already exists. If login fails, use reset_password:true with this endpoint, or fix D1.',
      },
      409
    );
  }

  const email = (body.email ?? 'admin@bonum.coffee').trim().toLowerCase();
  const password = body.password ?? 'admin123';
  const displayName = (body.display_name ?? 'Platform Admin').trim() || 'Platform Admin';

  const taken = await env.DB.prepare(
    'SELECT id FROM users WHERE email IS NOT NULL AND lower(email) = ?'
  )
    .bind(email)
    .first();

  if (taken) {
    return c.json(
      {
        error:
          'That email is already registered. Choose another email or fix the user in D1.',
      },
      409
    );
  }

  const id = crypto.randomUUID();

  try {
    await env.DB.prepare(`
      INSERT INTO users (id, email, role, password_hash, display_name)
      VALUES (?, ?, 'admin', ?, ?)
    `)
      .bind(id, email, password, displayName)
      .run();
  } catch (err) {
    console.error('bootstrap-admin:', err);
    return c.json({ error: 'Insert failed — check users table / migrations.' }, 500);
  }

  return c.json({
    ok: true,
    email,
    message: 'Admin created. POST /v1/auth/login with this email and password.',
  });
}
