import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { Profile } from '@/models/Profile';
import { sendEmail } from '@/lib/mailer';
import WelcomeEmail from '@/emails/WelcomeEmail';
import { registerLeaderObject, registerMemberObject, registerIndividualObject } from '@/lib/validators/auth';
import { fail } from '@/lib/api';
import crypto from 'crypto';

const registerSchema = z.discriminatedUnion('reg_type', [
  registerLeaderObject,
  registerMemberObject,
  registerIndividualObject,
]);

export async function POST(req: Request) {
  let body: unknown;
  try { body = await req.json(); } catch { return fail('Invalid JSON', 400); }
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) return fail('Validation failed', 422, { fields: parsed.error.flatten().fieldErrors });
  const data = parsed.data;

  if ('password' in data && data.password !== data.password_confirmation) {
    return fail('Passwords do not match', 422, { fields: { password_confirmation: ['Passwords do not match'] } });
  }

  await connectDB();

  const email = (data.email || '').toLowerCase();
  const phone = data.tel;

  if (email) {
    const existing = await User.findOne({ $or: [{ email }, { phone }] });
    if (existing) return fail('Email or phone already registered', 409);
  } else {
    const existingPhone = await User.findOne({ phone });
    if (existingPhone) return fail('Phone already registered', 409);
  }

  const isLeader = data.reg_type === 'leader';
  const password = ('password' in data ? data.password : undefined) ?? crypto.randomBytes(8).toString('hex');

  const user = await User.create({
    name: data.name,
    email: email || `${phone}@noemail.tsg`,
    phone,
    password,
    role: isLeader ? 'leader' : 'member',
    isBlocked: true,
  });

  await Profile.create({
    user: user._id,
    state: 'state' in data ? data.state : '',
    lga: data.lga,
    ward: data.ward,
    vid: data.voter_card,
    address: data.location,
    zone: 'zone' in data ? data.zone : undefined,
    organization: isLeader ? data.orgName : ('organization' in data ? data.organization : undefined),
    headquarter: isLeader ? data.orgHeadquarter : undefined,
    orgAddress: isLeader ? data.orgAddress : undefined,
    position: isLeader ? data.position : undefined,
    stateOrigin: 'state' in data ? data.state : undefined,
  });

  if (email) {
    try {
      await sendEmail({
        to: email,
        subject: 'Welcome to TSG',
        react: WelcomeEmail({ firstName: data.name.split(' ')[0]! }),
      });
    } catch (err) {
      console.error('welcome email failed', err);
    }
  }

  return NextResponse.json({ ok: true, data: { message: 'Registration received. Awaiting approval.' } });
}
