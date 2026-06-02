import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { connectDB } from '@/lib/db';
import { Post } from '@/models/Post';
import { Category } from '@/models/Category';
import BlogSidebar from '@/components/public/BlogSidebar';

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  await connectDB();
  const post = await Post.findOne({ link: slug }).select('title excerpt').lean();
  if (!post) return { title: 'Post not found' };
  return { title: post.title, description: post.excerpt || undefined };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  await connectDB();

  const post = await Post.findOneAndUpdate(
    { link: slug, status: '1' },
    { $inc: { views: 1 } },
    { new: true },
  ).populate('user', 'name').populate('category', 'title link').lean();

  if (!post) return notFound();

  const [categories, latest] = await Promise.all([
    Category.find().sort({ title: 1 }).lean(),
    Post.find({ status: '1', _id: { $ne: post._id } }).sort({ createdAt: -1 }).limit(5).select('title link thumbnail createdAt').lean(),
  ]);

  const thumb = post.thumbnail
    ? (post.thumbnail.startsWith('/') || post.thumbnail.startsWith('http') ? post.thumbnail : `/storage/images/${post.thumbnail}`)
    : null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 grid lg:grid-cols-[1fr_320px] gap-10">
      <article>
        <h1 className="text-4xl font-bold mb-3">{post.title}</h1>
        <div className="text-sm text-gray-500 mb-6 flex gap-3">
          {typeof post.user === 'object' && post.user && 'name' in post.user && (
            <span>by {(post.user as { name: string }).name}</span>
          )}
          {post.createdAt && <span>{new Date(post.createdAt).toLocaleDateString()}</span>}
          {typeof post.category === 'object' && post.category && 'title' in post.category && (
            <Link href={`/category/${(post.category as { link: string }).link}`} className="text-[var(--tsg-green)]">
              {(post.category as { title: string }).title}
            </Link>
          )}
        </div>
        {thumb && (
          <div className="aspect-video relative rounded overflow-hidden mb-6">
            <Image src={thumb} alt={post.title} fill className="object-cover" sizes="(max-width: 768px) 100vw, 70vw" />
          </div>
        )}
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: post.content || '' }} />
      </article>
      <BlogSidebar categories={categories} latest={latest} />
    </div>
  );
}
