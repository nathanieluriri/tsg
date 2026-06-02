import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { OtpToken, generateOtp, hashOtp } from '@/models/OtpToken';
import { sendEmail } from '@/lib/mailer';
import OtpEmail from '@/emails/OtpEmail';
import { forgotPasswordSchema } from '@/lib/validators';
import { fail, readJson } from '@/lib/api';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import { OTP_TTL_SECONDS } from '@/lib/config';

export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = rateLimit({ key: `fp:${ip}`, limit: 5, windowMs: 60_000 });
  if (!rl.ok) return fail('Too many attempts, try again shortly', 429);

  const parsed = await readJson(req, forgotPasswordSchema);
  if ('error' in parsed) return parsed.error;
  const { email } = parsed.data;
  const norm = email.toLowerCase();

  await connectDB();
  const user = await User.findOne({ email: norm });

  if (user) {
    const otp = generateOtp();
    await OtpToken.deleteMany({ email: norm, purpose: 'password-reset' });
    await OtpToken.create({
      email: norm,
      tokenHash: hashOtp(otp),
      purpose: 'password-reset',
      expiresAt: new Date(Date.now() + OTP_TTL_SECONDS * 1000),
    });
    try {
      await sendEmail({
        to: norm,
        subject: 'Your password reset code',
        react: OtpEmail({ name: user.name, token: otp }),
      });
    } catch (err) {
      console.error('OTP email failed', err);
      return fail('Failed to send OTP email. Try again.', 500);
    }
  }

  return NextResponse.json({ ok: true, data: { message: 'If that email exists, an OTP has been sent.' } });
}
