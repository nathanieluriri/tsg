import { NextResponse } from 'next/server';
import crypto from 'crypto';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { sendEmail } from '@/lib/mailer';
import AdminInviteEmail from '@/emails/AdminInviteEmail';
import { addAdminSchema } from '@/lib/validators';
import { fail, readJson } from '@/lib/api';
import { requireApiRole } from '@/lib/guard';
import { APP_URL } from '@/lib/config';

export async function POST(req: Request) {
  const guard = await requireApiRole('super admin');
  if (guard instanceof NextResponse) return guard;
  const parsed = await readJson(req, addAdminSchema);
  if ('error' in parsed) return parsed.error;

  await connectDB();
  if (await User.findOne({ $or: [{ email: parsed.data.email.toLowerCase() }, { phone: parsed.data.phone }] })) {
    return fail('Email or phone already registered', 409);
  }
  const tempPassword = crypto.randomBytes(6).toString('hex');
  const user = await User.create({
    name: parsed.data.name,
    email: parsed.data.email.toLowerCase(),
    phone: parsed.data.phone,
    password: tempPassword,
    role: parsed.data.role,
    isBlocked: false,
  });

  try {
    await sendEmail({
      to: parsed.data.email,
      subject: 'Your administrator account is ready',
      react: AdminInviteEmail({ email: parsed.data.email, tempPassword, loginUrl: `${APP_URL}/login` }),
    });
  } catch (err) {
    console.error('admin invite email failed', err);
  }
  return NextResponse.json({ ok: true, data: { id: user._id } });
}
