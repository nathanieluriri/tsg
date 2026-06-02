import type { Metadata } from 'next';
import Link from 'next/link';
import { REGIONS } from '@/lib/config';

export const metadata: Metadata = { title: 'Regional Registration' };

export default function RegionPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Regional Registration</h1>
      <p className="text-gray-600 mb-8">Choose your geopolitical zone.</p>
      <div className="mb-8">
        <Link href="/state-register/Region" className="inline-block bg-[var(--tsg-green)] text-white px-6 py-3 rounded font-semibold">
          Register at Regional Level
        </Link>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {REGIONS.map((r) => (
          <Link key={r} href={`/state-register/${encodeURIComponent(r)}`} className="border rounded p-4 text-center hover:bg-gray-50">{r}</Link>
        ))}
      </div>
    </div>
  );
}
