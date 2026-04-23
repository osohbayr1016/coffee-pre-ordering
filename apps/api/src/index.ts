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
}

const app = new Hono<{ Bindings: Bindings }>()

// ── Global middleware ─────────────────────────────
app.use('*', logger())
app.use('*', cors({
  origin: (origin, c) => c.env.CORS_ORIGIN,
  allowMethods: ['GET', 'POST', 'PATCH', 'DELETE'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

// ── Health check ──────────────────────────────────
app.get('/', (c) => c.json({ status: 'ok', env: c.env.ENVIRONMENT }))

// ── Routes (add as you build each one) ───────────
import { authRouter } from './routes/auth';
import { shopsRouter } from './routes/shops';

app.route('/v1/auth', authRouter);
app.route('/v1/shops', shopsRouter);

export default app
