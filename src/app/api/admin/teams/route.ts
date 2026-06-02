import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Team } from '@/models/Team';
import { teamSchema } from '@/lib/validators';
import { readJson } from '@/lib/api';
import { requireApiAuth } from '@/lib/guard';

export async function GET() {
  const guard = await requireApiAuth();
  if (guard instanceof NextResponse) return guard;
  await connectDB();
  const teams = await Team.find().sort({ order: 1, createdAt: -1 }).lean();
  return NextResponse.json({ ok: true, data: teams });
}

export async function POST(req: Request) {
  const guard = await requireApiAuth();
  if (guard instanceof NextResponse) return guard;
  const parsed = await readJson(req, teamSchema);
  if ('error' in parsed) return parsed.error;
  await connectDB();
  const team = await Team.create(parsed.data);
  return NextResponse.json({ ok: true, data: team });
}
