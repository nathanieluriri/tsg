'use client';

import { useEffect, useState } from 'react';

interface ImageRec { _id: string; title: string; description?: string; link: string }

export default function ImagesClient() {
  const [items, setItems] = useState<ImageRec[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    const res = await fetch('/api/admin/images');
    const json = await res.json();
    if (json.ok) setItems(json.data);
  }
  useEffect(() => { load(); }, []);

  async function upload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setUploading(true);
    setError(null);
    try {
      const form = new FormData(e.currentTarget);
      const res = await fetch('/api/admin/images', { method: 'POST', body: form });
      const json = await res.json();
      if (!res.ok || !json.ok) { setError(json.error || 'Upload failed'); return; }
      e.currentTarget.reset();
      await load();
    } finally { setUploading(false); }
  }

  async function remove(id: string) {
    if (!confirm('Delete this image?')) return;
    await fetch(`/api/admin/images/${id}`, { method: 'DELETE' });
    await load();
  }

  return (
    <div className="space-y-6">
      <form onSubmit={upload} className="bg-white p-4 border rounded grid sm:grid-cols-3 gap-3">
        <input name="title" placeholder="Title" required className="border rounded px-3 py-2" />
        <input name="description" placeholder="Description (optional)" className="border rounded px-3 py-2" />
        <input name="pic" type="file" accept="image/*" required className="border rounded px-3 py-2" />
        <button disabled={uploading} className="sm:col-span-3 bg-[var(--tsg-green)] text-white px-4 py-2 rounded disabled:opacity-50">
          {uploading ? 'Uploading…' : 'Upload image'}
        </button>
        {error && <p className="sm:col-span-3 text-sm text-red-600">{error}</p>}
      </form>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {items.map((img) => (
          <div key={img._id} className="border rounded overflow-hidden bg-white">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img.link} alt={img.title} className="w-full aspect-square object-cover" />
            <div className="p-2">
              <p className="text-sm font-medium truncate">{img.title}</p>
              <button onClick={() => remove(img._id)} className="text-xs text-red-600 mt-1">Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
