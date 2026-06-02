import type { Metadata } from 'next';
import Link from 'next/link';
import { NIGERIAN_STATES } from '@/lib/config';

export const metadata: Metadata = { title: 'National Registration' };

export default function NationalsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">National Registration</h1>
      <p className="text-gray-600 mb-8">Choose your state to begin registration.</p>
      <div className="mb-8">
        <Link href="/state-register/National" className="inline-block bg-[var(--tsg-green)] text-white px-6 py-3 rounded font-semibold">
          Register at National Level
        </Link>
      </div>
      <h2 className="text-xl font-bold mb-4">Or register by state</h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {NIGERIAN_STATES.map((s) => (
          <Link key={s} href={`/state-register/${encodeURIComponent(s)}`} className="border rounded p-3 text-center hover:bg-gray-50">{s}</Link>
        ))}
      </div>
    </div>
  );
}
