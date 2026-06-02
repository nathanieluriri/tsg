import Link from 'next/link';
import type { CategoryDoc } from '@/models/Category';
import type { PostDoc } from '@/models/Post';

interface Props {
  categories: (CategoryDoc & { postCount?: number })[];
  latest: Pick<PostDoc, 'title' | 'link' | 'thumbnail' | 'createdAt'>[];
}

export default function BlogSidebar({ categories, latest }: Props) {
  return (
    <aside className="space-y-6">
      <form action="/search" method="get" className="flex">
        <input name="q" placeholder="Search…" className="flex-1 border rounded-l px-3 py-2" />
        <button className="bg-[var(--tsg-green)] text-white px-4 rounded-r">Go</button>
      </form>
      <div>
        <h3 className="font-bold mb-3">Categories</h3>
        <ul className="space-y-1 text-sm">
          {categories.map((c) => (
            <li key={String(c._id)}>
              <Link href={`/category/${c.link}`} className="hover:text-[var(--tsg-green)]">
                {c.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-bold mb-3">Recent posts</h3>
        <ul className="space-y-3">
          {latest.map((p) => (
            <li key={p.link} className="text-sm">
              <Link href={`/b/${p.link}`} className="hover:text-[var(--tsg-green)] block font-medium">
                {p.title}
              </Link>
              {p.createdAt && (
                <span className="text-xs text-gray-500">{new Date(p.createdAt).toLocaleDateString()}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
