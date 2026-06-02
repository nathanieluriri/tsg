import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Faq } from '@/models/Faq';
import { faqSchema } from '@/lib/validators';
import { fail, readJson } from '@/lib/api';
import { requireAdminApi } from '@/lib/guard';

interface Ctx { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Ctx) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;
  await connectDB();
  const faq = await Faq.findById(id).lean();
  if (!faq) return fail('Not found', 404);
  return NextResponse.json({ ok: true, data: faq });
}

export async function PATCH(req: Request, { params }: Ctx) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;
  const parsed = await readJson(req, faqSchema);
  if ('error' in parsed) return parsed.error;
  await connectDB();
  const faq = await Faq.findByIdAndUpdate(id, parsed.data, { new: true });
  if (!faq) return fail('Not found', 404);
  return NextResponse.json({ ok: true, data: faq });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;
  await connectDB();
  await Faq.findByIdAndDelete(id);
  return NextResponse.json({ ok: true, data: { deleted: true } });
}
