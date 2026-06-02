import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { sendEmail } from '@/lib/mailer';
import DisapprovalEmail from '@/emails/DisapprovalEmail';
import { fail } from '@/lib/api';
import { requireAdminApi } from '@/lib/guard';

interface Ctx { params: Promise<{ id: string }> }

export async function POST(req: Request, { params }: Ctx) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;
  let reason = '';
  try { const body = await req.json(); reason = body?.reason || ''; } catch {}
  await connectDB();
  const user = await User.findById(id);
  if (!user) return fail('Not found', 404);
  user.isBlocked = true;
  await user.save();
  if (user.email && !user.email.endsWith('@noemail.tsg')) {
    try {
      await sendEmail({ to: user.email, subject: 'Account status update', react: DisapprovalEmail({ name: user.name, reason }) });
    } catch (err) {
      console.error('disapproval email failed', err);
    }
  }
  return NextResponse.json({ ok: true, data: { disapproved: true } });
}
