import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Post } from '@/models/Post';
import { postSchema } from '@/lib/validators';
import { fail, readJson } from '@/lib/api';
import { requireAdminApi } from '@/lib/guard';

interface Ctx { params: Promise<{ id: string }> }

export async function GET(_req: Request, { params }: Ctx) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;
  await connectDB();
  const post = await Post.findById(id).populate('category', 'title link').lean();
  if (!post) return fail('Not found', 404);
  return NextResponse.json({ ok: true, data: post });
}

export async function PATCH(req: Request, { params }: Ctx) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;
  const parsed = await readJson(req, postSchema);
  if ('error' in parsed) return parsed.error;
  await connectDB();
  const updated = await Post.findByIdAndUpdate(id, {
    title: parsed.data.title,
    category: parsed.data.category,
    status: parsed.data.status,
    thumbnail: parsed.data.thumbnail || '',
    content: parsed.data.content,
    excerpt: parsed.data.excerpt,
    tags: parsed.data.tags,
  }, { new: true });
  if (!updated) return fail('Not found', 404);
  return NextResponse.json({ ok: true, data: updated });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  const { id } = await params;
  await connectDB();
  await Post.findByIdAndDelete(id);
  return NextResponse.json({ ok: true, data: { deleted: true } });
}
