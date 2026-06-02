'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@/components/ui/Alert';
import { NIGERIAN_STATES, REGIONS } from '@/lib/config';

interface Props { orgs: string[] }

export default function RegisterForm({ orgs }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const form = new FormData(e.currentTarget);
      const body = Object.fromEntries(form.entries());
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error || 'Registration failed');
        return;
      }
      setInfo('Registration received. You will be notified once approved.');
      setTimeout(() => router.push('/login'), 1500);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <Alert kind="error">{error}</Alert>}
      {info && <Alert kind="success">{info}</Alert>}
      <input type="hidden" name="reg_type" value="member" />
      <div>
        <label className="block text-sm font-medium mb-1">Organization</label>
        <select name="organization" required className="w-full border rounded px-3 py-2">
          <option value="">Select…</option>
          {orgs.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Full name</label>
        <input name="name" required minLength={3} maxLength={50} className="w-full border rounded px-3 py-2" />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">State</label>
          <select name="state" required className="w-full border rounded px-3 py-2">
            <option value="">Select…</option>
            {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Zone</label>
          <select name="zone" required className="w-full border rounded px-3 py-2">
            <option value="">Select…</option>
            {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">LGA</label>
          <input name="lga" required className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Ward</label>
          <input name="ward" required className="w-full border rounded px-3 py-2" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Phone</label>
          <input name="tel" type="tel" required className="w-full border rounded px-3 py-2" />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email (optional)</label>
          <input name="email" type="email" className="w-full border rounded px-3 py-2" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Current location</label>
        <input name="location" required className="w-full border rounded px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Voter&apos;s card ID</label>
        <input name="voter_card" required minLength={19} maxLength={21} className="w-full border rounded px-3 py-2" />
      </div>
      <button type="submit" disabled={loading} className="w-full bg-[var(--tsg-green)] text-white py-2 rounded disabled:opacity-50">
        {loading ? 'Submitting…' : 'Register'}
      </button>
    </form>
  );
}
