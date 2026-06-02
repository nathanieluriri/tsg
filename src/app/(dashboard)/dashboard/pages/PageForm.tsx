'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Init { title: string; description: string; keywords: string; thumbnail: string; content: string; status: '0' | '1' }
interface Props { pageId?: string; initial?: Init }

export default function PageForm({ pageId, initial }: Props) {
  const router = useRouter();
  const [data, setData] = useState<Init>(initial ?? { title: '', description: '', keywords: '', thumbnail: '', content: '', status: '0' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const url = pageId ? `/api/admin/pages/${pageId}` : '/api/admin/pages';
      const res = await fetch(url, { method: pageId ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const json = await res.json();
      if (!json.ok) { setError(json.error || 'Failed'); return; }
      router.push('/dashboard/pages');
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={submit} className="bg-white p-6 rounded border space-y-4 max-w-3xl">
      {error && <div className="bg-red-50 border border-red-300 p-3 rounded text-sm text-red-900">{error}</div>}
      <input value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} required placeholder="Title" className="w-full border rounded px-3 py-2" />
      <input value={data.description} onChange={(e) => setData({ ...data, description: e.target.value })} placeholder="Meta description" className="w-full border rounded px-3 py-2" />
      <input value={data.keywords} onChange={(e) => setData({ ...data, keywords: e.target.value })} placeholder="Keywords" className="w-full border rounded px-3 py-2" />
      <input value={data.thumbnail} onChange={(e) => setData({ ...data, thumbnail: e.target.value })} placeholder="Thumbnail URL" className="w-full border rounded px-3 py-2" />
      <textarea value={data.content} onChange={(e) => setData({ ...data, content: e.target.value })} required placeholder="Content (HTML)" rows={14} className="w-full border rounded px-3 py-2 font-mono text-sm" />
      <select value={data.status} onChange={(e) => setData({ ...data, status: e.target.value as '0' | '1' })} className="w-full border rounded px-3 py-2">
        <option value="0">Draft</option>
        <option value="1">Published</option>
      </select>
      <div className="flex justify-end">
        <button disabled={loading} className="bg-[var(--tsg-green)] text-white px-6 py-2 rounded disabled:opacity-50">{loading ? 'Saving…' : 'Save'}</button>
      </div>
    </form>
  );
}
