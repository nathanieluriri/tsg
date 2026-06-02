'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@/components/ui/Alert';
import { NIGERIAN_STATES, REGIONS } from '@/lib/config';

interface Props { state: string; designation?: string; type?: string }

export default function StateRegisterForm({ state, designation, type }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const form = new FormData(e.currentTarget);
      const body = Object.fromEntries(form.entries());
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) { setError(json.error || 'Registration failed'); return; }
      setSuccess('Registration submitted. You will be notified once approved.');
      setTimeout(() => router.push('/login'), 2000);
    } finally {
      setLoading(false);
    }
  }

  const isZone = type === 'zone';

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <Alert kind="error">{error}</Alert>}
      {success && <Alert kind="success">{success}</Alert>}
      <input type="hidden" name="reg_type" value="leader" />
      <input type="hidden" name="state" value={state} />
      <div className="grid sm:grid-cols-2 gap-3">
        <input name="orgName" placeholder="Organization name" required className="border rounded px-3 py-2" />
        <input name="orgHeadquarter" placeholder="Headquarter" required className="border rounded px-3 py-2" />
      </div>
      <input name="orgAddress" placeholder="Organization address" required className="w-full border rounded px-3 py-2" />
      <input name="name" placeholder="Leader full name" required minLength={3} maxLength={50} className="w-full border rounded px-3 py-2" />
      <input name="position" placeholder="Position" defaultValue={designation || ''} required className="w-full border rounded px-3 py-2" />
      {isZone && (
        <select name="zone" required className="w-full border rounded px-3 py-2">
          <option value="">Select zone…</option>
          {REGIONS.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
      )}
      <select name="state_origin" required className="w-full border rounded px-3 py-2">
        <option value="">Select state of origin…</option>
        {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
      <div className="grid sm:grid-cols-2 gap-3">
        <input name="lga" placeholder="LGA" required className="border rounded px-3 py-2" />
        <input name="ward" placeholder="Ward" required className="border rounded px-3 py-2" />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <input name="tel" type="tel" placeholder="Phone" required className="border rounded px-3 py-2" />
        <input name="email" type="email" placeholder="Email" required className="border rounded px-3 py-2" />
      </div>
      <input name="location" placeholder="Current location" required className="w-full border rounded px-3 py-2" />
      <input name="voter_card" placeholder="Voter's Card ID" required minLength={19} maxLength={21} className="w-full border rounded px-3 py-2" />
      <div className="grid sm:grid-cols-2 gap-3">
        <input name="password" type="password" placeholder="Password" minLength={8} required className="border rounded px-3 py-2" />
        <input name="password_confirmation" type="password" placeholder="Confirm password" minLength={8} required className="border rounded px-3 py-2" />
      </div>
      <button disabled={loading} className="w-full bg-[var(--tsg-green)] text-white py-2 rounded disabled:opacity-50">
        {loading ? 'Submitting…' : 'Register'}
      </button>
    </form>
  );
}
