import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Image } from '@/models/Image';
import { saveImage } from '@/lib/uploads';
import { fail } from '@/lib/api';
import { requireAdminApi } from '@/lib/guard';
import { MAX_UPLOAD_BYTES } from '@/lib/config';

export async function GET() {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  await connectDB();
  const images = await Image.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ ok: true, data: images });
}

export async function POST(req: Request) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;

  let form: FormData;
  try { form = await req.formData(); } catch { return fail('Invalid multipart body', 400); }
  const file = form.get('pic') as File | null;
  const title = String(form.get('title') || '');
  const description = String(form.get('description') || '');
  if (!file || !title) return fail('Missing file or title', 422);
  if (file.size > MAX_UPLOAD_BYTES) return fail('File too large (max 2MB)', 413);
  if (!file.type.startsWith('image/')) return fail('Only image files are allowed', 415);

  await connectDB();
  const buffer = Buffer.from(await file.arrayBuffer());
  const saved = await saveImage(buffer, file.name, file.type);
  const image = await Image.create({ title, description, link: saved.url, gridfsId: saved.id });
  return NextResponse.json({ ok: true, data: image });
}
