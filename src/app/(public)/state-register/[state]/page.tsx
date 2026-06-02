import type { Metadata } from 'next';
import StateRegisterForm from './StateRegisterForm';

export const metadata: Metadata = { title: 'State Registration' };

interface Props {
  params: Promise<{ state: string }>;
  searchParams: Promise<{ designation?: string; type?: string }>;
}

export default async function StateRegisterPage({ params, searchParams }: Props) {
  const { state } = await params;
  const { designation, type } = await searchParams;
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Leader Registration</h1>
      <p className="text-gray-600 mb-6">Registering for: <strong>{decodeURIComponent(state)}</strong></p>
      <StateRegisterForm state={decodeURIComponent(state)} designation={designation} type={type} />
    </div>
  );
}
