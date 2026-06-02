import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db';
import { Category } from '@/models/Category';
import { Post } from '@/models/Post';
import PostCard from '@/components/public/PostCard';
import BlogSidebar from '@/components/public/BlogSidebar';

interface Props { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string }> }
const PER_PAGE = 12;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  await connectDB();
  const cat = await Category.findOne({ link: slug }).select('title').lean();
  return { title: cat?.title || 'Category' };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { page: pageParam } = await searchParams;
  const page = Math.max(1, parseInt(pageParam || '1', 10));
  await connectDB();

  const category = await Category.findOne({ link: slug }).lean();
  if (!category) return notFound();

  const [total, posts, categories, latest] = await Promise.all([
    Post.countDocuments({ category: category._id, status: '1' }),
    Post.find({ category: category._id, status: '1' }).sort({ createdAt: -1 }).skip((page - 1) * PER_PAGE).limit(PER_PAGE).populate('user', 'name').lean(),
    Category.find().sort({ title: 1 }).lean(),
    Post.find({ status: '1' }).sort({ createdAt: -1 }).limit(5).select('title link thumbnail createdAt').lean(),
  ]);

  const totalPages = Math.max(1, Math.ceil(total / PER_PAGE));

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 grid lg:grid-cols-[1fr_320px] gap-10">
      <div>
        <h1 className="text-3xl font-bold mb-1">{category.title}</h1>
        {category.description && <p className="text-gray-600 mb-6">{category.description}</p>}
        {posts.length === 0 ? (
          <p className="text-gray-600">No posts in this category yet.</p>
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
              <a key={n} href={`/category/${slug}?page=${n}`} className={`px-3 py-1 rounded border ${n === page ? 'bg-[var(--tsg-green)] text-white' : 'bg-white'}`}>{n}</a>
            ))}
          </div>
        )}
      </div>
      <BlogSidebar categories={categories} latest={latest} />
    </div>
  );
}
