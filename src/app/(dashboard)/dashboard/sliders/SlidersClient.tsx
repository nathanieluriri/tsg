'use client';

import { useEffect, useState } from 'react';

interface Slider { _id: string; image: { _id: string; title: string; link: string } | string; status: '0' | '1' }

export default function SlidersClient({ images }: { images: { id: string; title: string; link: string }[] }) {
  const [items, setItems] = useState<Slider[]>([]);
  const [imageId, setImageId] = useState(images[0]?.id || '');

  async function load() {
    const res = await fetch('/api/admin/sliders');
    const json = await res.json();
    if (json.ok) setItems(json.data);
  }
  useEffect(() => { load(); }, []);

  async function add() {
    if (!imageId) return;
    await fetch('/api/admin/sliders', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ image: imageId, status: '1' }) });
    await load();
  }

  async function remove(id: string) {
    if (!confirm('Remove this slider?')) return;
    await fetch(`/api/admin/sliders/${id}`, { method: 'DELETE' });
    await load();
  }

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 border rounded flex gap-3 items-center">
        <select value={imageId} onChange={(e) => setImageId(e.target.value)} className="border rounded px-3 py-2 flex-1">
          {images.map((i) => <option key={i.id} value={i.id}>{i.title}</option>)}
        </select>
        <button onClick={add} className="bg-[var(--tsg-green)] text-white px-4 py-2 rounded">Add slider</button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map((s) => (
          <div key={s._id} className="border rounded overflow-hidden bg-white">
            {typeof s.image === 'object' && s.image && 'link' in s.image && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={s.image.link} alt={s.image.title} className="w-full aspect-video object-cover" />
            )}
            <div className="p-2 flex justify-between items-center">
              <span className="text-sm">{typeof s.image === 'object' && 'title' in s.image ? s.image.title : ''}</span>
              <button onClick={() => remove(s._id)} className="text-xs text-red-600">Remove</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
