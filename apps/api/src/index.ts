import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'

// Type for Cloudflare bindings
type Bindings = {
  DB:       D1Database
  IMAGES:   R2Bucket
  SESSIONS: KVNamespace
  ENVIRONMENT:  string
  CORS_ORIGIN:  string
  QPAY_SECRET:  string  // from .dev.vars
  JWT_SECRET:   string  // from .dev.vars
  BOOTSTRAP_ADMIN_SECRET?: string
}

const app = new Hono<{ Bindings: Bindings }>()

// ── Global middleware ─────────────────────────────
app.use('*', logger())
app.use('*', cors({
  origin: (origin, c) => c.env.CORS_ORIGIN,
  allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Bootstrap-Secret'],
  credentials: true,
}))

// ── Health check ──────────────────────────────────
app.get('/', (c) => c.json({ status: 'ok', env: c.env.ENVIRONMENT }))

// ── Routes (add as you build each one) ───────────
import { authRouter } from './routes/auth';
import { shopsRouter } from './routes/shops';
import { uploadRouter } from './routes/upload';
import { adminRouter } from './routes/admin';
import { ordersRouter } from './routes/orders';
import { usersRouter } from './routes/users';

app.route('/v1/auth', authRouter);
app.route('/v1/shops', shopsRouter);
app.route('/v1/upload', uploadRouter);
app.route('/v1/admin', adminRouter);
app.route('/v1/orders', ordersRouter);
app.route('/v1/users', usersRouter);

export default app
