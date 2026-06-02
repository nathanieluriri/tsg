import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import { Post } from '@/models/Post';
import { postSchema } from '@/lib/validators';
import { fail, readJson } from '@/lib/api';
import { requireAdminApi } from '@/lib/guard';
import { slugify } from '@/lib/slugify';

export async function GET() {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  await connectDB();
  const posts = await Post.find().sort({ createdAt: -1 }).populate('user', 'name').populate('category', 'title link').lean();
  return NextResponse.json({ ok: true, data: posts });
}

export async function POST(req: Request) {
  const guard = await requireAdminApi();
  if (guard instanceof NextResponse) return guard;
  const parsed = await readJson(req, postSchema);
  if ('error' in parsed) return parsed.error;
  const { title, category, status, thumbnail, content, excerpt, tags } = parsed.data;
  await connectDB();
  let link = slugify(title);
  let n = 0;
  while (await Post.exists({ link })) { n += 1; link = `${slugify(title)}-${n}`; }
  const post = await Post.create({
    title,
    link,
    category,
    status,
    thumbnail: thumbnail || '',
    content,
    excerpt,
    tags,
    user: guard.userId,
    description: excerpt.slice(0, 200),
  });
  return NextResponse.json({ ok: true, data: post });
}
