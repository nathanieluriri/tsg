import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'FG Ministries' };

const MINISTRIES = [
  { name: 'Federal Ministry of Finance', url: 'https://finance.gov.ng' },
  { name: 'Federal Ministry of Education', url: 'https://education.gov.ng' },
  { name: 'Federal Ministry of Works', url: 'https://works.gov.ng' },
  { name: 'Federal Ministry of Health', url: 'https://health.gov.ng' },
  { name: 'Federal Ministry of Agriculture', url: 'https://fmard.gov.ng' },
  { name: 'Federal Ministry of Power', url: 'https://power.gov.ng' },
  { name: 'Federal Ministry of Defence', url: 'https://defence.gov.ng' },
  { name: 'Federal Ministry of Foreign Affairs', url: 'https://foreignaffairs.gov.ng' },
  { name: 'Federal Ministry of Justice', url: 'https://justice.gov.ng' },
  { name: 'Federal Ministry of Information', url: 'https://fmino.gov.ng' },
];

export default function FgMinistriesPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Federal Government Ministries</h1>
      <p className="text-gray-600 mb-8">Direct links to FG ministry websites.</p>
      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        {MINISTRIES.map((m) => (
          <a key={m.url} href={m.url} target="_blank" rel="noopener noreferrer" className="border rounded p-4 hover:shadow">
            <p className="font-semibold">{m.name}</p>
            <p className="text-sm text-gray-500 mt-1">Visit website →</p>
          </a>
        ))}
      </div>
    </div>
  );
}
