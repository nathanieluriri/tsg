import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db';
import { Page } from '@/models/Page';

interface Props { params: Promise<{ slug: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  await connectDB();
  const page = await Page.findOne({ link: slug, status: '1' }).select('title description keywords').lean();
  if (!page) return { title: 'Page not found' };
  return { title: page.title, description: page.description || undefined, keywords: page.keywords || undefined };
}

export default async function CmsPage({ params }: Props) {
  const { slug } = await params;
  await connectDB();
  const page = await Page.findOne({ link: slug, status: '1' }).lean();
  if (!page) return notFound();

  return (
    <article className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-4xl font-bold mb-6">{page.title}</h1>
      <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: page.content || '' }} />
    </article>
  );
}
