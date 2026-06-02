import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Group Registration' };

export default function GroupRegPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Group Registration</h1>
      <p className="text-gray-600 mb-8">Choose how your group will register.</p>
      <div className="grid md:grid-cols-3 gap-4">
        <Link href="/nationals" className="border rounded p-6 hover:shadow text-center">
          <h3 className="font-bold text-lg mb-2">National</h3>
          <p className="text-sm text-gray-600">Register at the national level</p>
        </Link>
        <Link href="/sub-nationals" className="border rounded p-6 hover:shadow text-center">
          <h3 className="font-bold text-lg mb-2">Sub-National</h3>
          <p className="text-sm text-gray-600">Northern or southern divisions</p>
        </Link>
        <Link href="/region" className="border rounded p-6 hover:shadow text-center">
          <h3 className="font-bold text-lg mb-2">Regional</h3>
          <p className="text-sm text-gray-600">By geopolitical zone</p>
        </Link>
      </div>
    </div>
  );
}
