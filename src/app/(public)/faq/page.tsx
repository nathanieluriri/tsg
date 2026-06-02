import type { Metadata } from 'next';
import { connectDB } from '@/lib/db';
import { Faq } from '@/models/Faq';

export const metadata: Metadata = { title: 'FAQ' };

export default async function FaqPage() {
  await connectDB();
  const faqs = await Faq.find().lean();
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-6">Frequently Asked Questions</h1>
      {faqs.length === 0 ? (
        <p className="text-gray-600">No FAQs yet.</p>
      ) : (
        <div className="space-y-3">
          {faqs.map((f) => (
            <details key={String(f._id)} className="border rounded p-4">
              <summary className="font-medium cursor-pointer">{f.question}</summary>
              <p className="mt-2 text-gray-700">{f.answer}</p>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
