import type { Metadata } from 'next';
import { connectDB } from '@/lib/db';
import { Post } from '@/models/Post';
import { Category } from '@/models/Category';
import PostCard from '@/components/public/PostCard';
import BlogSidebar from '@/components/public/BlogSidebar';

export const metadata: Metadata = { title: 'Search' };

interface Props { searchParams: Promise<{ q?: string; query?: string }> }

export default async function SearchPage({ searchParams }: Props) {
  const { q, query } = await searchParams;
  const term = (q || query || '').trim();
  await connectDB();

  const filter = term ? { $or: [{ title: { $regex: term, $options: 'i' } }, { tags: { $regex: term, $options: 'i' } }], status: '1' as const } : { _id: null };
  const [posts, categories, latest] = await Promise.all([
    term ? Post.find(filter).sort({ createdAt: -1 }).limit(50).populate('user', 'name').lean() : Promise.resolve([] as never[]),
    Category.find().sort({ title: 1 }).lean(),
    Post.find({ status: '1' }).sort({ createdAt: -1 }).limit(5).select('title link thumbnail createdAt').lean(),
  ]);

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 grid lg:grid-cols-[1fr_320px] gap-10">
      <div>
        <h1 className="text-3xl font-bold mb-1">Search</h1>
        <p className="text-gray-600 mb-6">{term ? `Results for: ${term}` : 'Enter a search term in the sidebar.'}</p>
        {posts.length === 0 ? (
          <p className="text-gray-600">{term ? 'No results found.' : 'Type a search above.'}</p>
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
      </div>
      <BlogSidebar categories={categories} latest={latest} />
    </div>
  );
}
