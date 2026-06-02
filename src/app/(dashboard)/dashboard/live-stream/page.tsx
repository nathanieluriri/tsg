import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Live stream' };

export default function LiveStreamPage() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-2">Live stream</h1>
      <p className="text-gray-500">Live streaming is not yet enabled.</p>
    </>
  );
}
