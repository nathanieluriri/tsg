import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { setSessionCookie } from '@/lib/auth';
import { loginSchema } from '@/lib/validators';
import { fail, readJson } from '@/lib/api';
import { rateLimit, clientIp } from '@/lib/rate-limit';

export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = rateLimit({ key: `login:${ip}`, limit: 5, windowMs: 60_000 });
  if (!rl.ok) return fail('Too many attempts, try again shortly', 429);

  const parsed = await readJson(req, loginSchema);
  if ('error' in parsed) return parsed.error;
  const { email, password } = parsed.data;

  await connectDB();
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return fail('Invalid credentials', 401);
  if (user.status === '1') return fail('Your account has been suspended', 403);
  if (user.isBlocked) return fail('Account pending approval', 403);

  const valid = await user.comparePassword(password);
  if (!valid) return fail('Invalid credentials', 401);

  await setSessionCookie({ userId: user._id.toHexString(), role: user.role });

  return NextResponse.json({ ok: true, data: { redirect: '/dashboard', role: user.role } });
}
