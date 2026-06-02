import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { newPasswordSchema } from '@/lib/validators';
import { fail, readJson } from '@/lib/api';

export async function POST(req: Request) {
  const c = await cookies();
  const resetEmail = c.get('tsg_reset')?.value;

  const parsed = await readJson(req, newPasswordSchema);
  if ('error' in parsed) return parsed.error;
  const { email, password } = parsed.data;

  if (!resetEmail || resetEmail.toLowerCase() !== email.toLowerCase()) {
    return fail('Reset session invalid or expired. Please start over.', 401);
  }

  await connectDB();
  const user = await User.findOne({ email: email.toLowerCase() });
  if (!user) return fail('Account not found', 404);

  user.password = password;
  await user.save();

  c.delete('tsg_reset');

  return NextResponse.json({ ok: true, data: { redirect: '/login', message: 'Password updated. Please log in.' } });
}
