'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@/components/ui/Alert';

export default function NewPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/new-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, password_confirmation: confirm }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error || 'Failed to update password');
        return;
      }
      router.push('/login');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert kind="error">{error}</Alert>}
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">New password</label>
        <input type="password" minLength={8} required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded px-3 py-2" />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Confirm password</label>
        <input type="password" minLength={8} required value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full border rounded px-3 py-2" />
      </div>
      <button type="submit" disabled={loading} className="w-full bg-[var(--tsg-green)] text-white py-2 rounded disabled:opacity-50">
        {loading ? 'Updating…' : 'Update password'}
      </button>
    </form>
  );
}
