import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Team } from '@/models/Team';
import { teamSchema } from '@/lib/validators';
import { fail, readJson } from '@/lib/api';
import { requireApiAuth } from '@/lib/guard';

interface Ctx { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Ctx) {
  const guard = await requireApiAuth();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;
  await connectDB();
  const team = await Team.findById(id).lean();
  if (!team) return fail('Not found', 404);
  return NextResponse.json({ ok: true, data: team });
}

export async function PATCH(req: Request, { params }: Ctx) {
  const guard = await requireApiAuth();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;
  const parsed = await readJson(req, teamSchema);
  if ('error' in parsed) return parsed.error;
  await connectDB();
  const team = await Team.findByIdAndUpdate(id, parsed.data, { new: true });
  if (!team) return fail('Not found', 404);
  return NextResponse.json({ ok: true, data: team });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const guard = await requireApiAuth();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;
  await connectDB();
  await Team.findByIdAndDelete(id);
  return NextResponse.json({ ok: true, data: { deleted: true } });
}
