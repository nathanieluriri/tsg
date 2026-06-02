import type { Metadata } from 'next';
import ImagesClient from './ImagesClient';

export const metadata: Metadata = { title: 'Images' };

export default function ImagesPage() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Image library</h1>
      <ImagesClient />
    </>
  );
}
