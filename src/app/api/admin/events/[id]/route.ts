import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { EventModel } from '@/models/Event';
import { eventSchema } from '@/lib/validators';
import { fail, readJson } from '@/lib/api';
import { requireAdminApi } from '@/lib/guard';

interface Ctx { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Ctx) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;
  await connectDB();
  const ev = await EventModel.findById(id).lean();
  if (!ev) return fail('Not found', 404);
  return NextResponse.json({ ok: true, data: ev });
}

export async function PATCH(req: Request, { params }: Ctx) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;
  const parsed = await readJson(req, eventSchema);
  if ('error' in parsed) return parsed.error;
  await connectDB();
  const ev = await EventModel.findByIdAndUpdate(id, parsed.data, { new: true });
  if (!ev) return fail('Not found', 404);
  return NextResponse.json({ ok: true, data: ev });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;
  await connectDB();
  await EventModel.findByIdAndDelete(id);
  return NextResponse.json({ ok: true, data: { deleted: true } });
}
