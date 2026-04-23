import { Hono } from 'hono'

type Bindings = {
  DB:          D1Database
  SESSIONS:    KVNamespace
  QPAY_SECRET: string
}

const app = new Hono<{ Bindings: Bindings }>()

app.get('/health', (c) => c.json({ ok: true }))

// QPay sends payment confirmation here
app.post('/qpay', async (c) => {
  const body = await c.req.json()

  // TODO: verify QPay HMAC signature
  // TODO: idempotency check (prevent double-processing)
  // TODO: update order status in D1

  return c.json({ received: true }, 200)
})

export default app
