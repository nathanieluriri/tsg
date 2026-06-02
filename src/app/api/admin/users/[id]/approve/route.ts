import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { sendEmail } from '@/lib/mailer';
import ApprovalEmail from '@/emails/ApprovalEmail';
import { fail } from '@/lib/api';
import { requireAdminApi } from '@/lib/guard';

interface Ctx { params: Promise<{ id: string }> }

export async function POST(_req: Request, { params }: Ctx) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;
  await connectDB();
  const user = await User.findById(id);
  if (!user) return fail('Not found', 404);
  user.isBlocked = false;
  await user.save();
  if (user.email && !user.email.endsWith('@noemail.tsg')) {
    try {
      await sendEmail({ to: user.email, subject: 'Your account has been approved', react: ApprovalEmail({ name: user.name }) });
    } catch (err) {
      console.error('approval email failed', err);
    }
  }
  return NextResponse.json({ ok: true, data: { approved: true } });
}
