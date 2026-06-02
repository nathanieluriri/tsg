import type { Metadata } from 'next';
import Link from 'next/link';
import { NORTHERN_STATES, SOUTHERN_STATES } from '@/lib/config';

export const metadata: Metadata = { title: 'Sub-National Registration' };

export default function SubNationalsPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Sub-National Registration</h1>
      <p className="text-gray-600 mb-8">Choose your sub-region.</p>
      <div className="mb-8">
        <Link href="/state-register/Sub-National" className="inline-block bg-[var(--tsg-green)] text-white px-6 py-3 rounded font-semibold">
          Register at Sub-National Level
        </Link>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <div>
          <h2 className="text-xl font-bold mb-3">Northern States</h2>
          <div className="grid grid-cols-2 gap-2">
            {NORTHERN_STATES.map((s) => (
              <Link key={s} href={`/state-register/${encodeURIComponent(s)}`} className="border rounded p-2 text-sm text-center hover:bg-gray-50">{s}</Link>
            ))}
          </div>
        </div>
        <div>
          <h2 className="text-xl font-bold mb-3">Southern States</h2>
          <div className="grid grid-cols-2 gap-2">
            {SOUTHERN_STATES.map((s) => (
              <Link key={s} href={`/state-register/${encodeURIComponent(s)}`} className="border rounded p-2 text-sm text-center hover:bg-gray-50">{s}</Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
