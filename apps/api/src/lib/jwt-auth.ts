import type { Context } from 'hono';
import { verify } from 'hono/jwt';

export type JwtPayload = {
  userId: string;
  role: string;
  shopId?: string | null;
  exp: number;
};

export async function verifyBearer(c: Context): Promise<JwtPayload | null> {
  const header = c.req.header('Authorization');
  if (!header?.startsWith('Bearer ')) return null;
  const token = header.slice(7);
  try {
    const secret =
      (c.env as { JWT_SECRET?: string }).JWT_SECRET || 'fallback_secret_for_local_dev';
    const payload = await verify(token, secret, 'HS256');
    return payload as JwtPayload;
  } catch {
    return null;
  }
}

export async function requireCustomerJwt(c: Context): Promise<JwtPayload | null> {
  const payload = await verifyBearer(c);
  if (!payload || payload.role !== 'customer') return null;
  return payload;
}
