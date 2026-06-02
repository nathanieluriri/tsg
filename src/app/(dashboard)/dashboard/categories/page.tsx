import type { Metadata } from 'next';
import CategoriesClient from './CategoriesClient';

export const metadata: Metadata = { title: 'Categories' };

export default function CategoriesPage() {
  return (
    <>
      <h1 className="text-2xl font-bold mb-6">Categories</h1>
      <CategoriesClient />
    </>
  );
}
