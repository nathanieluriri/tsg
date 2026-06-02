import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db';
import { Page } from '@/models/Page';
import PageForm from '../../PageForm';

export const metadata: Metadata = { title: 'Edit page' };

interface Props { params: Promise<{ id: string }> }

export default async function EditPagePage({ params }: Props) {
  const { id } = await params;
  await connectDB();
  const page = await Page.findById(id).lean();
  if (!page) return notFound();
  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Edit page</h1>
      <PageForm pageId={id} initial={{
        title: page.title,
        description: page.description || '',
        keywords: page.keywords || '',
        thumbnail: page.thumbnail || '',
        content: page.content || '',
        status: page.status as '0' | '1',
      }} />
    </>
  );
}
