'use client';

import { useState } from 'react';

interface Init { name: string; phone: string; state: string; lga: string; ward: string; voter_card: string }
interface Props { initial: Init; readonly: { email: string; role: string } }

export default function MyProfileForm({ initial, readonly }: Props) {
  const [data, setData] = useState<Init>(initial);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true); setMsg(null);
    try {
      const res = await fetch('/api/admin/profile', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) });
      const json = await res.json();
      setMsg(json.ok ? 'Saved' : (json.error || 'Failed'));
    } finally { setLoading(false); }
  }

  return (
    <form onSubmit={save} className="bg-white p-6 rounded border max-w-2xl space-y-3">
      {msg && <div className="bg-blue-50 border border-blue-300 p-3 rounded text-sm">{msg}</div>}
      <div className="grid sm:grid-cols-2 gap-3">
        <input value={readonly.email} readOnly className="border rounded px-3 py-2 bg-gray-100" />
        <input value={readonly.role} readOnly className="border rounded px-3 py-2 bg-gray-100" />
      </div>
      <input value={data.name} onChange={(e) => setData({ ...data, name: e.target.value })} required placeholder="Full name" minLength={3} maxLength={50} className="w-full border rounded px-3 py-2" />
      <input value={data.phone} onChange={(e) => setData({ ...data, phone: e.target.value })} required placeholder="Phone" className="w-full border rounded px-3 py-2" />
      <div className="grid sm:grid-cols-3 gap-3">
        <input value={data.state} onChange={(e) => setData({ ...data, state: e.target.value })} placeholder="State" className="border rounded px-3 py-2" />
        <input value={data.lga} onChange={(e) => setData({ ...data, lga: e.target.value })} placeholder="LGA" className="border rounded px-3 py-2" />
        <input value={data.ward} onChange={(e) => setData({ ...data, ward: e.target.value })} placeholder="Ward" className="border rounded px-3 py-2" />
      </div>
      <input value={data.voter_card} onChange={(e) => setData({ ...data, voter_card: e.target.value })} required placeholder="Voter ID" className="w-full border rounded px-3 py-2" />
      <button disabled={loading} className="bg-[var(--tsg-green)] text-white px-6 py-2 rounded disabled:opacity-50">{loading ? 'Saving…' : 'Save'}</button>
    </form>
  );
}
