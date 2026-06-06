'use client';

import { useState } from 'react';

export default function SubscribeForm() {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (res.ok && json.ok) {
        setMsg('Subscribed!');
        setEmail('');
      } else {
        setMsg(json.error || 'Failed to subscribe');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-2">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="w-full px-3 py-2 rounded text-gray-900"
      />
      <button disabled={loading} className="w-full bg-white text-[var(--tsg-green)] font-semibold py-2 rounded transition hover:bg-white/90 disabled:opacity-50">
        {loading ? '…' : 'Subscribe'}
      </button>
      {msg && <p className="text-xs">{msg}</p>}
    </form>
  );
}
