import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Setting } from '@/models/Setting';
import { sendEmail } from '@/lib/mailer';
import ContactNotificationEmail from '@/emails/ContactNotificationEmail';
import { contactSchema } from '@/lib/validators';
import { fail, readJson } from '@/lib/api';
import { rateLimit, clientIp } from '@/lib/rate-limit';

export async function POST(req: Request) {
  const ip = clientIp(req);
  const rl = rateLimit({ key: `contact:${ip}`, limit: 3, windowMs: 60_000 });
  if (!rl.ok) return fail('Please wait a moment before sending again', 429);

  const parsed = await readJson(req, contactSchema);
  if ('error' in parsed) return parsed.error;
  const { name, email, subject, message } = parsed.data;

  await connectDB();
  const setting = await Setting.getOrCreate();
  const to = setting.email || 'info@tsgweb.com';

  try {
    await sendEmail({
      to,
      subject: `Contact: ${subject}`,
      react: ContactNotificationEmail({ name, email, subject, message }),
    });
  } catch (err) {
    console.error('contact email failed', err);
    return fail('Failed to send message. Please try again.', 500);
  }

  return NextResponse.json({ ok: true, data: { message: 'Message sent' } });
}
