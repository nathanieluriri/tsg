import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Category } from '@/models/Category';
import { categorySchema } from '@/lib/validators';
import { fail, readJson } from '@/lib/api';
import { requireAdminApi } from '@/lib/guard';
import { slugify } from '@/lib/slugify';

interface Ctx { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Ctx) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;
  await connectDB();
  const cat = await Category.findById(id).lean();
  if (!cat) return fail('Not found', 404);
  return NextResponse.json({ ok: true, data: cat });
}

export async function PATCH(req: Request, { params }: Ctx) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;
  const parsed = await readJson(req, categorySchema);
  if ('error' in parsed) return parsed.error;
  await connectDB();
  const link = slugify(parsed.data.title);
  const updated = await Category.findByIdAndUpdate(id, { title: parsed.data.title, link, description: parsed.data.description || '' }, { new: true });
  if (!updated) return fail('Not found', 404);
  return NextResponse.json({ ok: true, data: updated });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;
  await connectDB();
  await Category.findByIdAndDelete(id);
  return NextResponse.json({ ok: true, data: { deleted: true } });
}
