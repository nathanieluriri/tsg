import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { Profile } from '@/models/Profile';
import { profileSchema } from '@/lib/validators';
import { fail, readJson } from '@/lib/api';
import { requireApiAuth } from '@/lib/guard';

export async function GET() {
  const guard = await requireApiAuth();
  if (guard instanceof NextResponse) return guard;
  await connectDB();
  const user = await User.findById(guard.userId).lean();
  const profile = await Profile.findOne({ user: guard.userId }).lean();
  return NextResponse.json({ ok: true, data: { user, profile } });
}

export async function PATCH(req: Request) {
  const guard = await requireApiAuth();
  if (guard instanceof NextResponse) return guard;
  const parsed = await readJson(req, profileSchema);
  if ('error' in parsed) return parsed.error;
  await connectDB();
  const user = await User.findById(guard.userId);
  if (!user) return fail('User not found', 404);
  const phoneClash = await User.findOne({ phone: parsed.data.phone, _id: { $ne: user._id } });
  if (phoneClash) return fail('Phone already used by another user', 409);
  user.name = parsed.data.name;
  user.phone = parsed.data.phone;
  await user.save();
  await Profile.findOneAndUpdate(
    { user: user._id },
    { user: user._id, state: parsed.data.state, lga: parsed.data.lga, ward: parsed.data.ward, vid: parsed.data.voter_card },
    { upsert: true, new: true },
  );
  return NextResponse.json({ ok: true, data: { user } });
}
