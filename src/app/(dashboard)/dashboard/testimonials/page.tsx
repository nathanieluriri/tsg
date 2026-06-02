import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Testimonials' };

export default function TestimonialsPage() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-2">Testimonials</h1>
      <p className="text-gray-500">Testimonials management is not yet enabled.</p>
    </>
  );
}
