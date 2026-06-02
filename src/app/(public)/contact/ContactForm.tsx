'use client';

import { useState } from 'react';
import Alert from '@/components/ui/Alert';

export default function ContactForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);
    try {
      const form = new FormData(e.currentTarget);
      const body = Object.fromEntries(form.entries());
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) { setError(json.error || 'Failed to send'); return; }
      setSuccess(true);
      e.currentTarget.reset();
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      {error && <Alert kind="error">{error}</Alert>}
      {success && <Alert kind="success">Message sent! We&apos;ll get back to you soon.</Alert>}
      <input name="name" placeholder="Your name" required className="w-full border rounded px-3 py-2" />
      <input name="email" type="email" placeholder="Your email" required className="w-full border rounded px-3 py-2" />
      <input name="subject" placeholder="Subject" required className="w-full border rounded px-3 py-2" />
      <textarea name="message" placeholder="Message" rows={5} required className="w-full border rounded px-3 py-2" />
      <button disabled={loading} className="bg-[var(--tsg-green)] text-white px-6 py-2 rounded disabled:opacity-50">
        {loading ? 'Sending…' : 'Send message'}
      </button>
    </form>
  );
}
