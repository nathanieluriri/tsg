import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { EventModel } from '@/models/Event';
import { eventSchema } from '@/lib/validators';
import { readJson } from '@/lib/api';
import { requireAdminApi } from '@/lib/guard';

export async function GET() {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  await connectDB();
  const events = await EventModel.find().sort({ start: -1 }).lean();
  return NextResponse.json({ ok: true, data: events });
}

export async function POST(req: Request) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  const parsed = await readJson(req, eventSchema);
  if ('error' in parsed) return parsed.error;
  await connectDB();
  const ev = await EventModel.create(parsed.data);
  return NextResponse.json({ ok: true, data: ev });
}
