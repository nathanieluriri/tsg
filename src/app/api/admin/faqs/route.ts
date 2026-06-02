import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Faq } from '@/models/Faq';
import { faqSchema } from '@/lib/validators';
import { readJson } from '@/lib/api';
import { requireAdminApi } from '@/lib/guard';

export async function GET() {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  await connectDB();
  const faqs = await Faq.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ ok: true, data: faqs });
}

export async function POST(req: Request) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  const parsed = await readJson(req, faqSchema);
  if ('error' in parsed) return parsed.error;
  await connectDB();
  const faq = await Faq.create(parsed.data);
  return NextResponse.json({ ok: true, data: faq });
}
