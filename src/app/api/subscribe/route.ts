import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Subscription } from '@/models/Subscription';
import { subscriptionSchema } from '@/lib/validators';
import { fail, readJson } from '@/lib/api';
import { rateLimit, clientIp } from '@/lib/rate-limit';

export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = rateLimit({ key: `sub:${ip}`, limit: 5, windowMs: 60_000 });
  if (!rl.ok) return fail('Too many attempts', 429);

  const parsed = await readJson(req, subscriptionSchema);
  if ('error' in parsed) return parsed.error;

  await connectDB();
  await Subscription.updateOne(
    { email: parsed.data.email.toLowerCase() },
    { $setOnInsert: { email: parsed.data.email.toLowerCase() } },
    { upsert: true },
  );

  return NextResponse.json({ ok: true, data: { message: 'Subscribed' } });
}
