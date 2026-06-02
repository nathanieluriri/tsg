import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Media' };

export default function MediaPage() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-2">Media</h1>
      <p className="text-gray-500">Use the Images section to manage media.</p>
    </>
  );
}
