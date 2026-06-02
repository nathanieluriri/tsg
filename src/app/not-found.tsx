import Link from 'next/link';

export default function NotFound() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center text-center p-8">
      <h1 className="text-6xl font-bold mb-2">404</h1>
      <p className="text-lg mb-6">The page you&apos;re looking for doesn&apos;t exist.</p>
      <Link href="/" className="px-4 py-2 bg-[var(--tsg-green)] text-white rounded">Go home</Link>
    </main>
  );
}
