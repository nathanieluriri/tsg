import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { sendEmail } from '@/lib/mailer';
import AdminPromotionEmail from '@/emails/AdminPromotionEmail';
import { fail } from '@/lib/api';
import { requireApiRole } from '@/lib/guard';

interface Ctx { params: Promise<{ id: string }> }

export async function POST(_req: Request, { params }: Ctx) {
  const guard = await requireApiRole('super admin');
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;
  await connectDB();
  const user = await User.findById(id);
  if (!user) return fail('Not found', 404);
  user.role = 'admin';
  await user.save();
  if (user.email && !user.email.endsWith('@noemail.tsg')) {
    try {
      await sendEmail({ to: user.email, subject: 'You have been promoted', react: AdminPromotionEmail({ name: user.name }) });
    } catch (err) {
      console.error('promotion email failed', err);
    }
  }
  return NextResponse.json({ ok: true, data: { promoted: true } });
}
