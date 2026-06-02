import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Page } from '@/models/Page';
import { pageSchema } from '@/lib/validators';
import { fail, readJson } from '@/lib/api';
import { requireAdminApi } from '@/lib/guard';

interface Ctx { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Ctx) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;
  await connectDB();
  const page = await Page.findById(id).lean();
  if (!page) return fail('Not found', 404);
  return NextResponse.json({ ok: true, data: page });
}

export async function PATCH(req: Request, { params }: Ctx) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;
  const parsed = await readJson(req, pageSchema);
  if ('error' in parsed) return parsed.error;
  await connectDB();
  const page = await Page.findByIdAndUpdate(id, parsed.data, { new: true });
  if (!page) return fail('Not found', 404);
  return NextResponse.json({ ok: true, data: page });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;
  await connectDB();
  await Page.findByIdAndDelete(id);
  return NextResponse.json({ ok: true, data: { deleted: true } });
}
