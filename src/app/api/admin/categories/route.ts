import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Category } from '@/models/Category';
import { categorySchema } from '@/lib/validators';
import { fail, readJson } from '@/lib/api';
import { requireAdminApi } from '@/lib/guard';
import { slugify } from '@/lib/slugify';

export async function GET() {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  await connectDB();
  const categories = await Category.find().sort({ title: 1 }).lean();
  return NextResponse.json({ ok: true, data: categories });
}

export async function POST(req: Request) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  const parsed = await readJson(req, categorySchema);
  if ('error' in parsed) return parsed.error;
  await connectDB();
  const link = slugify(parsed.data.title);
  if (await Category.exists({ link })) return fail('A category with that title exists', 409);
  const cat = await Category.create({ title: parsed.data.title, link, description: parsed.data.description || '' });
  return NextResponse.json({ ok: true, data: cat });
}
