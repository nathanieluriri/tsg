'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Alert from '@/components/ui/Alert';

export default function OtpForm() {
  const router = useRouter();
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ otp }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setError(json.error || 'Invalid OTP');
        return;
      }
      router.push('/new-password');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <Alert kind="error">{error}</Alert>}
      <div>
        <label className="block text-sm font-medium mb-1">6-digit code</label>
        <input
          type="text"
          inputMode="numeric"
          pattern="\d{6}"
          maxLength={6}
          required
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          className="w-full border rounded px-3 py-2 text-center text-2xl tracking-widest"
        />
      </div>
      <button type="submit" disabled={loading || otp.length !== 6} className="w-full bg-[var(--tsg-green)] text-white py-2 rounded disabled:opacity-50">
        {loading ? 'Verifying…' : 'Verify'}
      </button>
    </form>
  );
}
