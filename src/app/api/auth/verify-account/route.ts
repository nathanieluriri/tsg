import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { fail } from '@/lib/api';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export async function POST(req: Request) {
  let body;
  try { body = await req.json(); } catch { return fail('Invalid body', 400); }
  const parsed = schema.safeParse(body);
  if (!parsed.success) return fail('Invalid request', 422, { fields: parsed.error.flatten().fieldErrors });

  await connectDB();
  const user = await User.findOne({ email: parsed.data.email.toLowerCase() });
  if (!user) return fail('Account not found', 404);

  const ok = await user.comparePassword(parsed.data.password);
  if (!ok) return fail('Invalid credentials', 401);

  user.emailVerifiedAt = new Date();
  await user.save();

  return NextResponse.json({ ok: true, data: { message: 'Account verified' } });
}
