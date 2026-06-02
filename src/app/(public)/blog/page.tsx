import type { Metadata } from 'next';
import Link from 'next/link';
import { connectDB } from '@/lib/db';
import { Post } from '@/models/Post';
import { Category } from '@/models/Category';
import PostCard from '@/components/public/PostCard';
import BlogSidebar from '@/components/public/BlogSidebar';

export const metadata: Metadata = { title: 'Blog' };

interface Props { searchParams: Promise<{ page?: string }> }

const PER_PAGE = 12;

export default async function BlogPage({ searchParams }: Props) {
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam || '1', 10));
  await connectDB();

  const eventsCat = await Category.findOne({ link: 'events' }).lean();
  const filter = eventsCat ? { category: { $ne: eventsCat._id }, status: '1' } : { status: '1' };

  const [total, posts, categories, latest] = await Promise.all([
    Post.countDocuments(filter),
    Post.find(filter).sort({ createdAt: -1 }).skip((page - 1) * PER_PAGE).limit(PER_PAGE).populate('user', 'name').lean(),
    Category.find().sort({ title: 1 }).lean(),
    Post.find(filter).sort({ createdAt: -1 }).limit(5).select('title link thumbnail createdAt').lean(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 grid lg:grid-cols-[1fr_320px] gap-10">
      <div>
        <h1 className="text-3xl font-bold mb-6">Blog</h1>
        {posts.length === 0 ? (
          <p className="text-gray-600">No posts yet.</p>
        ) : (
          <div className="grid sm:grid-cols-2 gap-6">
            {posts.map((p) => (
              <PostCard key={String(p._id)} post={{
                link: p.link,
                title: p.title,
                excerpt: p.excerpt || undefined,
                thumbnail: p.thumbnail || undefined,
                authorName: typeof p.user === 'object' && p.user && 'name' in p.user ? (p.user as { name: string }).name : undefined,
                createdAt: p.createdAt,
              }} />
            ))}
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex gap-2 justify-center mt-8">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <Link key={n} href={`/blog?page=${n}`} className={`px-3 py-1 rounded border ${n === page ? 'bg-[var(--tsg-green)] text-white' : 'bg-white'}`}>{n}</Link>
            ))}
          </div>
        )}
      </div>
      <BlogSidebar categories={categories} latest={latest} />
    </div>
  );
}
