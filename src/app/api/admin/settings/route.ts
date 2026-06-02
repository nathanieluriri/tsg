import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Setting } from '@/models/Setting';
import { settingSchema } from '@/lib/validators';
import { readJson } from '@/lib/api';
import { requireAdminApi } from '@/lib/guard';

export async function GET() {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  await connectDB();
  const setting = await Setting.getOrCreate();
  return NextResponse.json({ ok: true, data: setting });
}

export async function PATCH(req: Request) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  const parsed = await readJson(req, settingSchema);
  if ('error' in parsed) return parsed.error;
  await connectDB();
  const existing = await Setting.getOrCreate();
  Object.assign(existing, parsed.data);
  await existing.save();
  return NextResponse.json({ ok: true, data: existing });
}
