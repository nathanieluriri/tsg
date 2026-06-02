import type { Metadata } from 'next';
import Link from 'next/link';
import { connectDB } from '@/lib/db';
import { Page } from '@/models/Page';
import PageDeleteButton from './PageDeleteButton';

export const metadata: Metadata = { title: 'Pages' };

export default async function PagesPage() {
  await connectDB();
  const pages = await Page.find().sort({ createdAt: -1 }).lean();
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Pages</h1>
        <Link href="/dashboard/pages/new" className="bg-[var(--tsg-green)] text-white px-4 py-2 rounded">New page</Link>
      </div>
      <table className="w-full border bg-white">
        <thead className="bg-gray-50"><tr><th className="text-left p-3">Title</th><th className="text-left p-3">Slug</th><th className="text-left p-3">Status</th><th></th></tr></thead>
        <tbody>
          {pages.map((p) => (
            <tr key={String(p._id)} className="border-t">
              <td className="p-3 font-medium">{p.title}</td>
              <td className="p-3 text-sm text-gray-500">/p/{p.link}</td>
              <td className="p-3 text-sm">{p.status === '1' ? 'Published' : 'Draft'}</td>
              <td className="p-3 text-right whitespace-nowrap">
                <Link href={`/dashboard/pages/${p._id}/edit`} className="text-blue-600 mr-3">Edit</Link>
                <PageDeleteButton id={String(p._id)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </>
  );
}
