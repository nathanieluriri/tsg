'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Init { title: string; category: string; status: '0' | '1'; thumbnail: string; content: string; excerpt: string; tags: string }
interface Props {
  postId?: string;
  initial?: Init;
  categories: { id: string; title: string }[];
  images: { id: string; title: string; link: string }[];
}

export default function PostForm({ postId, initial, categories, images }: Props) {
  const router = useRouter();
  const [data, setData] = useState<Init>(initial ?? { title: '', category: categories[0]?.id ?? '', status: '0', thumbnail: '', content: '', excerpt: '', tags: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const url = postId ? `/api/admin/posts/${postId}` : '/api/admin/posts';
      const res = await fetch(url, { method: postId ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const json = await res.json();
      if (!json.ok) { setError(json.error || 'Failed'); return; }
      router.push('/dashboard/posts');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="bg-white p-6 rounded border space-y-4 max-w-3xl">
      {error && <div className="bg-red-50 border border-red-300 p-3 rounded text-sm text-red-900">{error}</div>}
      <div>
        <label className="block text-sm font-medium mb-1">Title</label>
        <input value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} required className="w-full border rounded px-3 py-2" />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Category</label>
          <select value={data.category} onChange={(e) => setData({ ...data, category: e.target.value })} required className="w-full border rounded px-3 py-2">
            {categories.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Status</label>
          <select value={data.status} onChange={(e) => setData({ ...data, status: e.target.value as '0' | '1' })} className="w-full border rounded px-3 py-2">
            <option value="0">Draft</option>
            <option value="1">Published</option>
          </select>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Thumbnail</label>
        <select value={data.thumbnail} onChange={(e) => setData({ ...data, thumbnail: e.target.value })} className="w-full border rounded px-3 py-2">
          <option value="">— None —</option>
          {images.map((i) => <option key={i.id} value={i.link}>{i.title}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Excerpt</label>
        <textarea value={data.excerpt} onChange={(e) => setData({ ...data, excerpt: e.target.value })} required maxLength={500} rows={2} className="w-full border rounded px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Content (HTML)</label>
        <textarea value={data.content} onChange={(e) => setData({ ...data, content: e.target.value })} required rows={12} className="w-full border rounded px-3 py-2 font-mono text-sm" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Tags (comma-separated)</label>
        <input value={data.tags} onChange={(e) => setData({ ...data, tags: e.target.value })} required className="w-full border rounded px-3 py-2" />
      </div>
      <div className="flex justify-end">
        <button disabled={loading} className="bg-[var(--tsg-green)] text-white px-6 py-2 rounded disabled:opacity-50">{loading ? 'Saving…' : 'Save'}</button>
      </div>
    </form>
  );
}
