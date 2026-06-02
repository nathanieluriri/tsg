type Bucket = { tokens: number; updatedAt: number };
const buckets = new Map<string, Bucket>();

export interface RateLimitOptions {
  key: string;
  limit: number;
  windowMs: number;
}

export function rateLimit({ key, limit, windowMs }: RateLimitOptions): { ok: boolean; remaining: number } {
  const now = Date.now();
  const refillRate = limit / windowMs;
  const b = buckets.get(key) ?? { tokens: limit, updatedAt: now };
  const elapsed = now - b.updatedAt;
  b.tokens = Math.min(limit, b.tokens + elapsed * refillRate);
  b.updatedAt = now;
  if (b.tokens < 1) {
    buckets.set(key, b);
    return { ok: false, remaining: 0 };
  }
  b.tokens -= 1;
  buckets.set(key, b);
  return { ok: true, remaining: Math.floor(b.tokens) };
}

export function clientIp(req: Request): string {
  const xf = req.headers.get('x-forwarded-for');
  if (xf) return xf.split(',')[0]!.trim();
  return req.headers.get('x-real-ip') || 'unknown';
}
