'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface Init { name: string; role: string; bio: string; photo: string; order: number }
interface Props { teamId?: string; initial?: Init }

export default function TeamForm({ teamId, initial }: Props) {
  const router = useRouter();
  const [data, setData] = useState<Init>(initial ?? { name: '', role: '', bio: '', photo: '', order: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setError(null);
    try {
      const url = teamId ? `/api/admin/teams/${teamId}` : '/api/admin/teams';
      const res = await fetch(url, { method: teamId ? 'PATCH' : 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const json = await res.json();
      if (!json.ok) { setError(json.error || 'Failed'); return; }
      router.push('/dashboard/teams');
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={submit} className="bg-white p-6 rounded border space-y-3 max-w-2xl">
      {error && <div className="bg-red-50 border border-red-300 p-3 rounded text-sm text-red-900">{error}</div>}
      <input value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} required placeholder="Name" className="w-full border rounded px-3 py-2" />
      <input value={data.role} onChange={(e) => setData({ ...data, role: e.target.value })} placeholder="Role" className="w-full border rounded px-3 py-2" />
      <textarea value={data.bio} onChange={(e) => setData({ ...data, bio: e.target.value })} placeholder="Bio" rows={4} className="w-full border rounded px-3 py-2" />
      <input value={data.photo} onChange={(e) => setData({ ...data, photo: e.target.value })} placeholder="Photo URL or image link" className="w-full border rounded px-3 py-2" />
      <input value={data.order} onChange={(e) => setData({ ...data, order: Number(e.target.value) })} type="number" min={0} placeholder="Order" className="w-full border rounded px-3 py-2" />
      <button disabled={loading} className="bg-[var(--tsg-green)] text-white px-6 py-2 rounded disabled:opacity-50">{loading ? 'Saving…' : 'Save'}</button>
    </form>
  );
}
