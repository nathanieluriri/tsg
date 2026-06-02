import type { Metadata } from 'next';
import Link from 'next/link';
import { connectDB } from '@/lib/db';
import { Post } from '@/models/Post';
import DeleteButton from './DeleteButton';

export const metadata: Metadata = { title: 'Posts' };

export default async function PostsPage() {
  await connectDB();
  const posts = await Post.find().sort({ createdAt: -1 }).populate('user', 'name').populate('category', 'title').lean();

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Posts</h1>
        <Link href="/dashboard/posts/new" className="bg-[var(--tsg-green)] text-white px-4 py-2 rounded">New post</Link>
      </div>
      <div className="overflow-x-auto bg-white border rounded">
        <table className="w-full">
          <thead className="bg-gray-50"><tr><th className="text-left p-3">Title</th><th className="text-left p-3">Category</th><th className="text-left p-3">Author</th><th className="text-left p-3">Status</th><th className="text-left p-3">Views</th><th></th></tr></thead>
          <tbody>
            {posts.map((p) => (
              <tr key={String(p._id)} className="border-t">
                <td className="p-3 font-medium">{p.title}</td>
                <td className="p-3 text-sm">{typeof p.category === 'object' && p.category && 'title' in p.category ? (p.category as { title: string }).title : '—'}</td>
                <td className="p-3 text-sm">{typeof p.user === 'object' && p.user && 'name' in p.user ? (p.user as { name: string }).name : '—'}</td>
                <td className="p-3 text-sm"><span className={`px-2 py-1 rounded text-xs ${p.status === '1' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{p.status === '1' ? 'Published' : 'Draft'}</span></td>
                <td className="p-3 text-sm">{p.views}</td>
                <td className="p-3 text-right whitespace-nowrap">
                  <Link href={`/dashboard/posts/${p._id}/edit`} className="text-blue-600 mr-3">Edit</Link>
                  <DeleteButton id={String(p._id)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
