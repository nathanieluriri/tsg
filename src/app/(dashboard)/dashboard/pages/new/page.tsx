import type { Metadata } from 'next';
import PageForm from '../PageForm';

export const metadata: Metadata = { title: 'New page' };

export default function NewPagePage() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-6">New page</h1>
      <PageForm />
    </>
  );
}
