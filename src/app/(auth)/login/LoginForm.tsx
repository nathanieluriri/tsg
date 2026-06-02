'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Alert from '@/components/ui/Alert';

export default function LoginForm() {
  const router = useRouter();
  const search = useSearchParams();
  const redirectTo = search.get('redirect') || '/dashboard';
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error || 'Login failed');
        return;
      }
      router.push(redirectTo);
      router.refresh();
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
        <label className="block text-sm font-medium mb-1">Password</label>
        <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="w-full border rounded px-3 py-2" />
      </div>
      <button type="submit" disabled={loading} className="w-full bg-[var(--tsg-green)] text-white py-2 rounded disabled:opacity-50">
        {loading ? 'Signing in…' : 'Sign in'}
      </button>
      <div className="flex justify-between text-sm">
        <Link href="/forgot-password" className="text-[var(--tsg-green)] hover:underline">Forgot password?</Link>
        <Link href="/register" className="text-[var(--tsg-green)] hover:underline">Create account</Link>
      </div>
    </form>
  );
}
