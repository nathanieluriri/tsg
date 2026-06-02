'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@/components/ui/Alert';

export default function ForgotPasswordForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setInfo(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error || 'Failed to send OTP');
        return;
      }
      setInfo('If that email exists, an OTP has been sent. Check your inbox.');
      setTimeout(() => router.push('/secure-otp'), 1200);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert kind="error">{error}</Alert>}
      {info && <Alert kind="success">{info}</Alert>}
      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="w-full border rounded px-3 py-2" />
      </div>
      <button type="submit" disabled={loading} className="w-full bg-[var(--tsg-green)] text-white py-2 rounded disabled:opacity-50">
        {loading ? 'Sending…' : 'Send OTP'}
      </button>
    </form>
  );
}
