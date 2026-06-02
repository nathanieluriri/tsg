import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Page } from '@/models/Page';
import { pageSchema } from '@/lib/validators';
import { fail, readJson } from '@/lib/api';
import { requireAdminApi } from '@/lib/guard';
import { slugify } from '@/lib/slugify';

export async function GET() {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  await connectDB();
  const pages = await Page.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ ok: true, data: pages });
}

export async function POST(req: Request) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  const parsed = await readJson(req, pageSchema);
  if ('error' in parsed) return parsed.error;
  await connectDB();
  let link = slugify(parsed.data.title);
  let n = 0;
  while (await Page.exists({ link })) { n += 1; link = `${slugify(parsed.data.title)}-${n}`; }
  const page = await Page.create({ ...parsed.data, link });
  return NextResponse.json({ ok: true, data: page });
}
