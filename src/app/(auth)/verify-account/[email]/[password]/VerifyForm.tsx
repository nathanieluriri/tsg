'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@/components/ui/Alert';

interface Props { email: string; password: string }

export default function VerifyForm({ email, password }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  async function handleVerify() {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/auth/verify-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) { setError(json.error || 'Verification failed'); return; }
      setDone(true);
      setTimeout(() => router.push('/login'), 1500);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {error && <Alert kind="error">{error}</Alert>}
      {done && <Alert kind="success">Account verified. Redirecting to login…</Alert>}
      <p className="text-sm text-gray-700">Verifying <strong>{email}</strong>.</p>
      <button onClick={handleVerify} disabled={loading || done} className="w-full bg-[var(--tsg-green)] text-white py-2 rounded disabled:opacity-50">
        {loading ? 'Verifying…' : 'Verify account'}
      </button>
    </div>
  );
}
