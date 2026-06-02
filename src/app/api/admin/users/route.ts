import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { User } from '@/models/User';
import { requireAdminApi } from '@/lib/guard';

export async function GET(req: Request) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  const { searchParams } = new URL(req.url);
  const role = searchParams.get('role') || undefined;
  await connectDB();
  const filter = role ? { role } : {};
  const users = await User.find(filter).select('-password').sort({ createdAt: -1 }).lean();
  return NextResponse.json({ ok: true, data: users });
}
