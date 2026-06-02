import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { connectDB } from '@/lib/db';
import { OtpToken, hashOtp } from '@/models/OtpToken';
import { otpSchema } from '@/lib/validators';
import { fail, readJson } from '@/lib/api';

export async function POST(req: Request) {
  const parsed = await readJson(req, otpSchema);
  if ('error' in parsed) return parsed.error;
  const { otp } = parsed.data;

  await connectDB();
  const tokenHash = hashOtp(otp);
  const record = await OtpToken.findOne({
    tokenHash,
    purpose: 'password-reset',
    consumedAt: null,
    expiresAt: { $gt: new Date() },
  });
  if (!record) return fail('Invalid or expired OTP', 401);

  const c = await cookies();
  c.set('tsg_reset', record.email, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: 600,
  });

  await OtpToken.updateOne({ _id: record._id }, { $set: { consumedAt: new Date() } });

  return NextResponse.json({ ok: true, data: { redirect: '/new-password', email: record.email } });
}
