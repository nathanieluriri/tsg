import type { Metadata } from 'next';
import FaqsClient from './FaqsClient';

export const metadata: Metadata = { title: 'FAQs' };

export default function FaqsPage() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-6">FAQs</h1>
      <FaqsClient />
    </>
  );
}
